const express = require("express");
const router = express.Router();

const {
  registerUser,
  getUser,
  loginUser,
  emailVerify,
} = require("../controllers/user");


router.route('/getUserDetails').get(getUser);
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/verify/:code').get(emailVerify);

module.exports = router;