const express = require("express");
const router = express.Router();

const {
    createArticle,
    updateArticle,
    getArticlesByOwner,
    getArticlesById,
    getAllArticles
} = require("../controllers/articles");

router.route("/create").post(createArticle);
router.route("/update").patch(updateArticle);
router.route("/getArticlesByOwner").get(getArticlesByOwner);
router.route("/getArticlesById/:id").get(getArticlesById);
router.route("/getAllArticles").get(getAllArticles);

module.exports = router;