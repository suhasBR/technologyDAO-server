const express = require("express");
const router = express.Router();

const {
    getAllQuestions,
    getQuestionByID,
    addQuestion,
    addAnswer
} = require("../controllers/question");

router.route('/getAllQuestions').get(getAllQuestions);
router.route('/getQuestionByID/:qid').get(getQuestionByID);
router.route('/addQuestion').post(addQuestion);
router.route('/addAnswer').post(addAnswer);

module.exports = router;