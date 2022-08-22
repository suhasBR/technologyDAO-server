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

    const resp = await send_tokens(address, amount);
    console.log(`Transferred ${amount} tokens successfully to ${address}`)
    let finalTokens = currTokens - amount;

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.id },
      { tokens: finalTokens },
      { new: true }
    );
  
    res.status(201).json({updatedUser});
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

const send_tokens = async (toAddress, amount) => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY);
  const privateKey = process.env.PK;


  //convert amount MATIC to WEI
  amount = parseFloat(amount);
  amount = amount * 10**18;
  amount = amount.toString();

//   const feeData = await provider.getFeeData();
//   console.log("feeData :" + feeData);

  const signer = new ethers.Wallet(privateKey, provider);
  const address = "0xdC8f315456d8a64D2bB4F611cB451C78c309B60B";

  const myContract_write = new ethers.Contract(address, myAbi, signer);

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
