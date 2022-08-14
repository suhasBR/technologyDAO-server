const express = require("express");
const router = express.Router();

const {
    cashout,
} = require("../controllers/cashout");


router.route('/totdp').post(cashout);


module.exports = router;