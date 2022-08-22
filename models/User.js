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
    aiPoints:{
      type: Number,
      default:0
    },
    upvotesLeft:{
      type: Number,
      default: 10,
      min:0,
      max:10
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
    },
    memberType:{
      type: String,
      default: 'basic'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
