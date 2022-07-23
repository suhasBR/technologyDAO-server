const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    postedBy: {
      type: String,
      required: true,
    },
    answers: [{}],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", QuestionSchema);
