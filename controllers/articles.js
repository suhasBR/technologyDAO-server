const User = require("../models/User");
const Article = require("../models/Article");
const authWrapper = require("../middleware/auth");
const sanitize = require("mongo-sanitize");
const fs = require("fs");
const { makeStorageClient } = require("../ipfs/ipfs");
const { File } = require("web3.storage");

//{{localhost}}/api/v1/articles/create
const createArticle = authWrapper(async (req, res) => {
  try {
    req.body = sanitize(req.body);
    const {
      title,
      description,
      authorEmail,
      content,
      forkedFrom,
      wordCount,
      published,
    } = req.body;

    if (wordCount > 2000) {
      return res
        .status(400)
        .json({ msg: "Number of words more than the limit of 2000 words" });
    }

    const user = await User.findOne({ _id: req.user.id });

    //check if user has published <3 articles for the day

    const articlesPublished = await Article.find({
      author: req.user.id,
      updatedAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    console.log(articlesPublished.length);

    if (user.memberType === "basic") {
      if (articlesPublished.length >= 3) {
        return res.status(400).json({
          msg: "Article publishing limit for the day has reached, Upgrade to PRO for publishing more",
        });
      }
    }

    //publish article on IPFS and store the link
    const obj = {
      authorEmail,
      title,
      content,
      forkedFrom,
    };
    const toWrite = JSON.stringify(obj);
    const buffer = Buffer.from(JSON.stringify(obj));

    const files = [new File([buffer], `${title}.json`)];
    const client = makeStorageClient();
    const cid = await client.put(files);
    // let cidURL = "https://ipfs.io/ipfs/" + cid;
    let cidURL = cid;
    console.log("stored files with cid:", cidURL);

    const article = {
      title,
      description,
      content,
      forkedFrom,
      wordCount,
      author: req.user.id,
      authorEmail,
      published,
      cidURL,
    };
    // console.log(article, req.user);
    let newArticle = await Article.create(article);
    // let newArticle = {};

    //increment tokens (reward) for users
    let currTokens = 0;
    let finalTokens = 0;
    if (forkedFrom) {
      const forkedArticle = await Article.findOne({ _id: forkedFrom });
      const previouswordCount = forkedArticle.wordCount;
      currTokens = user.tokens;
      finalTokens = currTokens + 0.05 * wordCount - previouswordCount;
    } else {
      currTokens = user.tokens;
      finalTokens = currTokens + 0.05 * wordCount;
    }
    //normalize rewards
    finalTokens = 1 + finalTokens;

    //update finalTokens only if article is published

    if(article.published){
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.user.id },
        { tokens: finalTokens },
        { new: true }
      );
    }

    res.status(201).json({ newArticle });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

//{{localhost}}/api/v1/articles/createPaid
const createArticlePaid = authWrapper(async (req, res) => {
  try {
    req.body = sanitize(req.body);
    const {
      title,
      description,
      authorEmail,
      content,
      forkedFrom,
      wordCount,
      published,
    } = req.body;

    if (wordCount > 2000) {
      return res
        .status(400)
        .json({ msg: "Number of words more than the limit of 2000 words" });
    }

    const user = await User.findOne({ _id: req.user.id });

    if (user.tokens < 500) {
      return res
        .status(400)
        .json({ msg: "Not enough tokens. Need at least 500 tokens" });
    }

    //publish article on IPFS and store the link
    const obj = {
      authorEmail,
      title,
      content,
      forkedFrom,
    };
    const toWrite = JSON.stringify(obj);
    const buffer = Buffer.from(JSON.stringify(obj));

    const files = [new File([buffer], `${title}.json`)];
    const client = makeStorageClient();
    const cid = await client.put(files);
    // let cidURL = "https://ipfs.io/ipfs/" + cid;
    let cidURL = cid;
    console.log("stored files with cid:", cidURL);

    const article = {
      title,
      description,
      content,
      forkedFrom,
      wordCount,
      author: req.user.id,
      authorEmail,
      published,
      cidURL,
    };
    // console.log(article, req.user);
    let newArticle = await Article.create(article);
    // let newArticle = {};

    //increment tokens (reward) for users
    let currTokens = 0;
    let finalTokens = 0;
    if (forkedFrom) {
      const forkedArticle = await Article.findOne({ _id: forkedFrom });
      const previouswordCount = forkedArticle.wordCount;
      currTokens = user.tokens;
      finalTokens = currTokens + 0.05 * wordCount - previouswordCount;
    } else {
      currTokens = user.tokens;
      finalTokens = currTokens + 0.05 * wordCount;
    }
    //normalize rewards
    finalTokens = 1 + finalTokens;
    //deduct 500 tokens
    finalTokens = finalTokens - 500;

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.id },
      { tokens: finalTokens },
      { new: true }
    );

    res.status(201).json({ newArticle });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

//{{localhost}}/api/v1/articles/boostArticle
const boostArticle = authWrapper(async (req, res) => {
  try {
    req.body = sanitize(req.body);
    const { articleID, boostAmount, boostUntil } = req.body;
    const article = await Article.findOne({ _id: articleID });
    const currboostUntilDate = article.boostUntil;
    const currDate = new Date();

    //if already boosted then reject request
    if (currboostUntilDate) {
      if (currDate < new Date(currboostUntilDate)) {
        //boost is active
        return res.status(400).json({ msg: "Article Boost already active" });
      }
    }

    //update article with boost
    let updatedArticle = await Article.findOneAndUpdate(
      { _id: articleID },
      { boostUntil: boostUntil, boostAmount: boostAmount },
      { new: true }
    );

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.id },
      { $inc: { tokens: -boostAmount } },
      { new: true }
    );

    res.status(201).json({ updatedArticle });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

//{{localhost}}/api/v1/articles/update
const updateArticle = authWrapper(async (req, res) => {
  try {
    req.body = sanitize(req.body);
    const { id, title, description, content, wordCount, published } = req.body;
    if (wordCount > 2000) {
      return res
        .status(400)
        .json({ msg: "Number of words more than the limit of 2000 words" });
    }

    //check if user has published <3 articles for the day
    const articlesPublished = await Article.find({
      author: req.user.id,
      updatedAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    console.log(articlesPublished.length);

    //get current article details
    const currState = await Article.findOne({ _id: id });
    let prevWordCount = 0;
    if (currState.published) {
      const prevWordCount = currState.wordCount;
    }

    const user = await User.findOne({ _id: req.user.id });

    if (user.memberType === "basic") {
      if (articlesPublished.length >= 3) {
        return res
          .status(400)
          .json({ msg: "Article publishing limit for the day has reached" });
      }
    }

    const article = await Article.findOne({ _id: id });

    //publish article on IPFS and store the link
    const obj = {
      authorEmail: article.authorEmail,
      title: article.title,
      content,
      forkedFrom: article.forkedFrom,
    };
    const toWrite = JSON.stringify(obj);
    const buffer = Buffer.from(JSON.stringify(obj));

    const files = [new File([buffer], `${title}.json`)];
    const client = makeStorageClient();
    const cid = await client.put(files);
    // let cidURL = "https://ipfs.io/ipfs/" + cid;
    let cidURL = cid;
    console.log("stored files with cid:", cidURL);

    let updatedArticle = await Article.findOneAndUpdate(
      { _id: id },
      { title, description, content, wordCount, published, cidURL },
      { new: true }
    );

    //reward for additional words
    if (updatedArticle.published) {
      console.log('updating tokens to users..')
      let currTokens = 0;
      let finalTokens = 0;
      currTokens = user.tokens;
      finalTokens = currTokens + 0.05 * (wordCount - prevWordCount);
      console.log(finalTokens, prevWordCount);

      const updatedUser = await User.findOneAndUpdate(
        { _id: req.user.id },
        { tokens: finalTokens },
        { new: true }
      );
    }

  

    res.status(201).json({ updatedArticle });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

//{{localhost}}/api/v1/articles/updatePaid
const updateArticlePaid = authWrapper(async (req, res) => {
  try {
    req.body = sanitize(req.body);
    const { id, title, description, content, wordCount, published } = req.body;
    if (wordCount > 2000) {
      return res
        .status(400)
        .json({ msg: "Number of words more than the limit of 2000 words" });
    }

    const user = await User.findOne({ _id: req.user.id });

    if (user.tokens < 500) {
      return res
        .status(400)
        .json({ msg: "Not enough tokens. Need at least 500 tokens" });
    }

    //get current article details
    const currState = await Article.findOne({ _id: id });
    const prevWordCount = currState.wordCount;

    const article = await Article.findOne({ _id: id });

    //publish article on IPFS and store the link
    const obj = {
      authorEmail: article.authorEmail,
      title: article.title,
      content,
      forkedFrom: author.forkedFrom,
    };
    const toWrite = JSON.stringify(obj);
    const buffer = Buffer.from(JSON.stringify(obj));

    const files = [new File([buffer], `${title}.json`)];
    const client = makeStorageClient();
    const cid = await client.put(files);
    // let cidURL = "https://ipfs.io/ipfs/" + cid;
    let cidURL = cid;
    console.log("stored files with cid:", cidURL);

    let updatedArticle = await Article.findOneAndUpdate(
      { _id: id },
      { title, description, content, wordCount, published, cidURL },
      { new: true }
    );

    //reward for additional words
    let currTokens = 0;
    let finalTokens = 0;
    currTokens = user.tokens;
    finalTokens = currTokens + 0.05 * wordCount - prevWordCount;

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.id },
      { tokens: finalTokens },
      { new: true }
    );

    res.status(201).json({ updatedArticle });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

const upvoteArticle = authWrapper(async (req, res) => {
  try {
    req.body = sanitize(req.body);
    const { upvotes, articleID } = req.body;

    const user = await User.findOne({ _id: req.user.id });
    if (user.upvotesLeft === 0) {
      return res.status(400).json({ msg: "No Upvotes Left" });
    }

    //update upvotes for articleID
    let updatedArticle = await Article.findOneAndUpdate(
      { _id: articleID },
      { $inc: { upvotes: upvotes } },
      { new: true }
    );

    //update user and subtract the upvotes
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.id },
      { $inc: { upvotesLeft: -upvotes }, $inc: { tokens: upvotes * 0.05 } },
      { new: true }
    );

    res.status(201).json({ updatedArticle });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

//{{localhost}}/api/v1/articles/getArticlesByOwner
const getArticlesByOwner = authWrapper(async (req, res) => {
  try {
    const userID = req.user.id;

    //get article corresponding to the userId
    const articles = await Article.find({ author: userID }).sort({
      createdAt: -1,
    });
    res.status(201).json({ articles });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

//{{localhost}}/api/v1/articles/getArticlesById/:id
const getArticlesById = async (req, res) => {
  try {
    let id = req.params.id;
    id = sanitize(id);
    const article = await Article.findOne({ _id: id });
    res.status(201).json({ article });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

//{{localhost}}/api/v1/articles/getAllArticles
const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find({ published: true })
      .select("authorEmail boostAmount boostUntil content createdAt title")
      .sort({
        boostAmount: -1,
        boostUntil: -1,
        updatedAt: -1,
      });
    res.status(201).json({ articles });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

module.exports = {
  createArticle,
  updateArticle,
  getArticlesByOwner,
  getArticlesById,
  getAllArticles,
  upvoteArticle,
  boostArticle,
  createArticlePaid,
  updateArticlePaid,
};
