const Question = require("../models/Question");

//get request to get all questions
const getAllQuestions = async(req,res) => {
    try {
        const questions = await Question.find();
        res.status(201).json(questions);
    } catch (error) {
        console.log(error);
        res.status(501).json({
          err: true,
          msg: error,
        });
    }
}

//get request to get QuestionByID
const getQuestionByID = async(req,res) => {
    try{
        const question = await Question.findOne({_id:req.params.qid});
        res.status(201).json(question);
    }catch(error){
        console.log(error);
        res.status(501).json({
          err: true,
          msg: error,
        });
    }
}

//post request to add question
const addQuestion = async(req,res) => {
    try {
        const newQuestion = await Question.create(req.body);
        res.status(201).json( newQuestion );
    } catch (error) {
        console.log(error);
        res.status(501).json({
          err: true,
          msg: error,
        });
    }
}

//post request to add answer to a question
const addAnswer = async(req,res) => {
    try {
        const {qid,postedBy,answerText} = req.body;
        const question = await Question.findById(qid);
        if(!question){
            return res.status(400).json({
                err: true,
                msg: "Incorrect question ID",
              });
        }
        let currentAnswers = question.answers;
        currentAnswers.push({
            postedBy,
            answerText
        })
        
        const updatedQuestion = await Question.findOneAndUpdate(
            {_id: qid},
            {answers : currentAnswers},
            {new: true}
        )
        res.status(201).json(updatedQuestion);

    } catch (error) {
        console.log(error);
        res.status(501).json({
          err: true,
          msg: error,
        });
    }
}

module.exports = {
    getAllQuestions,
    getQuestionByID,
    addQuestion,
    addAnswer
}


