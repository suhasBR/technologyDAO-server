const express = require("express");
const router = express.Router();

const {
    createArticle,
    updateArticle,
    getArticlesByOwner,
    getArticlesById
} = require("../controllers/articles");

router.route("/create").post(createArticle);
router.route("/update").patch(updateArticle);
router.route("/getArticlesByOwner").get(getArticlesByOwner);
router.route("/getArticlesById/:id").get(getArticlesById);

module.exports = router;