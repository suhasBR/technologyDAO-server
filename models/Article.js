const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema(
    {
        title:{
            type: String,
            required: true
        },
        author:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        forkedFrom:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article'
        },
        description:{
            type: String
        },
        content:{
            type: String,
            required: true
        },
        wordCount:{
            type: Number,
            required:true
        }
}, { timestamps: true });

module.exports = mongoose.model("Article", ArticleSchema);
