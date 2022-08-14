const User = require("../models/User");
const randomstring = require("randomstring");
const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");
const authWrapper = require("../middleware/auth");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sanitize = require("mongo-sanitize");

const registerUser = async (req, res) => {
  req.body = sanitize(req.body);
  let { email, password, referralID } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    let referredUser = await User.findOne({ referralCode: referralID });
    if (!referredUser) {
      return res.status(400).json({ msg: "Invalid referral code" });
    }

    const currReferrals = referredUser.referrals;

    // if (referralID !== "RnTnoL"){
    //   if (currReferrals == 2) {
    //     return res.status(400).json({ msg: "Referral Limit reached" });
    //   }
    // }

    //generate referral code
    const ref1 = randomstring.generate({
      length: 6,
      charset: "alphabetic",
    });

    //generate string for email auth
    const val = crypto.webcrypto;
    const array = new Uint32Array(1);
    const iv = val.getRandomValues(array);
    const rand_num = iv[0];
    // console.log(rand_num);

    sendEmail(email, rand_num);

    //creating User
    user = new User({
      email,
      password,
      referredBy: referralID,
      referralCode: ref1,
      verificationCode: rand_num,
    });

    //encrypt password using
    await bcrypt.hash(password, 10, async (err, hash) => {
      user.password = hash;
      await user.save();

      //id we can get from the promise we get from await user.save
      const payload = {
        user: {
          id: user.id,
        },
      };

      //update user
      const updatedUser = await User.findOneAndUpdate(
        { referralCode: referralID },
        { referrals: currReferrals + 1 },
        { new: true }
      );

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;

          res.json({ token });
        }
      );
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

const getUser = authWrapper(async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id }).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

const loginUser = async (req, res) => {
  req.body = sanitize(req.body);
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ msg: "User does not exist!" });
    }

    //compare password for validation
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    //return jsonwebtoken

    //id we can get from the promise we get from await user.save
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      config.get("jwtSecret"),
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server ERror");
  }
};

const emailVerify = async (req, res) => {
  try {
    const code = req.params.code;
    const user = await User.findOne({ verificationCode: code });
    if (user) {
      const user_updated = await User.findOneAndUpdate(
        { verificationCode: code },
        { verified: true },
        { new: true }
      );
      res.status(200).send(`Verification successful for ${user_updated.email}`);
    }
  } catch (error) {
    console.error(err.message);
    res.status(500).send("Server ERror");
  }
};

const sendEmail = (email_addr, data) => {
  console.log(email_addr, data);
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "techdaosanjay@gmail.com",
      pass: "uumlalwyyxxqnnyc",
    },
  });

  send();

  async function send() {
    const result = await transporter.sendMail({
      from: "techdaosanjay@gmail.com",
      to: email_addr,
      subject: "Email Verification for Technology DAO",
      text: `Dear User,
      Click the following link to verify your email
      https://technologydao.herokuapp.com/api/v1/users/verify/${data}`,
    });

    console.log(JSON.stringify(result, null, 4));
  }
};

module.exports = {
  registerUser,
  getUser,
  loginUser,
  emailVerify,
};
