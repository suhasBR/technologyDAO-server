const User = require("../models/User");
const Transaction = require("../models/Transaction");
const sanitize = require("mongo-sanitize");
const authWrapper = require("../middleware/auth");

const logTransaction = authWrapper(async (req, res) => {
  try {
    req.body = sanitize(req.body);
    req.user = sanitize(req.user);
    const { from, to, amount, comments } = req.body;
    const newTX = {
      from,
      to,
      amount,
      comments,
    };
    let newTransaction = await Transaction.create(newTX);
    res.status(201).json({ newTransaction });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = {
    logTransaction
}
