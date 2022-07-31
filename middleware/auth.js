const jwt = require('jsonwebtoken');
const config = require('config');

const authWrapper = (fn) => {
  return async (req, res, next) => {
    try {
      const token = req.header("x-auth-token");

      //Check if no token
      if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
      }
      const decoded = jwt.verify(token, config.get("jwtSecret"));
      req.user = decoded.user;

      await fn(req, res, next);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Server Error" });
    }
  };
};

module.exports = authWrapper;
