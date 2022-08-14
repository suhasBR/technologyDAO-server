const User = require("../models/User");
const sanitize = require("mongo-sanitize");
const authWrapper = require("../middleware/auth");
const myAbi = require("../abi/myAbi.json");
const ethers = require("ethers");

const cashout = authWrapper(async (req, res) => {
  try {
    req.body = sanitize(req.body);
    req.user = sanitize(req.user);
    const { amount, address } = req.body;
    const user = await User.findOne({ _id: req.user.id });
    let currTokens = user.tokens;
    if (amount > currTokens) {
      return res
        .status(400)
        .json({ msg: "Cannot withdraw more than total balance" });
    }

    const res = await send_tokens(address, amount);
    let finalTokens = currTokens - amount;

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.id },
      { tokens: finalTokens },
      { new: true }
    );

    return res.status(200).json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

const send_tokens = async (toAddress, amount) => {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.MONGO_URI
  );
  const privateKey = process.env.PK;
  console.log(privateKey)

  //convert amount MATIC to WEI
  amount = parseInt(amount);
  amount = amount * 10**18;

  const feeData = await provider.getFeeData();
//   console.log("feeData :" + feeData);

  const signer = new ethers.Wallet(privateKey, provider);
  const address = "0xB1F2411BAf6e9E0227077A8f8ec9CccDc79512C5";

  const myContract_write = new ethers.Contract(address, myAbi.abi, signer);
  console.log('done')

  try {
    let result = await myContract_write.mint(toAddress, amount);
    console.log(result);
  } catch (error) {
    console.log("error.." + error);
  }
};

module.exports={
    cashout
}
