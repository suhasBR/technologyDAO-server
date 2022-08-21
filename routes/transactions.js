const express = require("express");
const router = express.Router();

const {
    logTransaction,
} = require("../controllers/transactions");


router.route('/logTransaction').post(logTransaction);


module.exports = router;