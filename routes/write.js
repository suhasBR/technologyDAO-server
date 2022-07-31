const express = require("express");
const router = express.Router();

const {
    genSuggestion,
} = require("../controllers/write");


router.route('/prompt').post(genSuggestion);


module.exports = router;