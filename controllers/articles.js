const User = require("../models/User");
const Article = require("../models/Article");
const authWrapper = require("../middleware/auth");
const sanitize = require("mongo-sanitize");

//{{localhost}}/api/v1/articles/create
const createArticle = authWrapper(async (req, res) => {
  try {
    req.body = sanitize(req.body);
    const { title, description, authorEmail, content, forkedFrom, wordCount } = req.body;
    const article = {
      title,
      description,
      content,
      forkedFrom,
      wordCount,
      author: req.user.id,
      authorEmail
    };
    console.log(article, req.user);
    let newArticle = await Article.create(article);
    res.status(201).json({ newArticle });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

//{{localhost}}/api/v1/articles/update
const updateArticle = authWrapper(async (req, res) => {
  try {
    req.body = sanitize(req.body);
    const { id, title, description, content, wordCount } = req.body;
    let updatedArticle = await Article.findOneAndUpdate(
      { _id: id },
      { title, description, content, wordCount },
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
    const articles = await Article.find({ author: userID }).sort({createdAt:-1});;
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
    const articles = await Article.find({}).sort({createdAt:-1});
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
  getAllArticles
};
