const express = require("express");
const router = express.Router();

const {
    createArticle,
    updateArticle,
    getArticlesByOwner,
    getArticlesById,
    getAllArticles,
    upvoteArticle,
    boostArticle,
    createArticlePaid,
    updateArticlePaid
} = require("../controllers/articles");

router.route("/create").post(createArticle);
router.route("/update").patch(updateArticle);
router.route("/getArticlesByOwner").get(getArticlesByOwner);
router.route("/getArticlesById/:id").get(getArticlesById);
router.route("/getAllArticles").get(getAllArticles);
router.route("/upvote").post(upvoteArticle);
router.route("/boostArticle").post(boostArticle);
router.route("/createPaid").post(createArticlePaid);
router.route("/updatePaid").post(updateArticlePaid);

module.exports = router;