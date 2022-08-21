const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
    {
        from:{
          type: mongoose.Schema.Types.ObjectId,    
          required:true
        },
        to:{
           type: mongoose.Schema.Types.ObjectId,
           required: true  
        },
        amount:{
            type: Number,
            required:true
        },
        comments:{
            type:String,
            required: true
        }
}, { timestamps: true });

module.exports = mongoose.model("Transaction", TransactionSchema);
