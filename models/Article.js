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
        authorEmail:{
            type: String,
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
        },
        published: {
            type: Boolean,
            required: true,
        },
        upvotes:{
            type: Number,
            default: 0
        },
        boostAmount:{
            type:Number,
            default:0
        },
        boostUntil:{
            type: Date,
            default: null
        },
        cidURL:{
            type:String,
            default:null
        }
}, { timestamps: true });

module.exports = mongoose.model("Article", ArticleSchema);
