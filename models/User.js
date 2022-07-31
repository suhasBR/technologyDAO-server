const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    referredBy: {
      type: String,
    },
    referralCode:{
      type: String
    },
    tokens:{
      type: Number,
      default:0,
    },
    verified:{
      type: Boolean,
      default: false
    },
    referrals: {
      type: Number,
      default: 0
    },
    verificationCode :{
      type: Number,
      unique: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
