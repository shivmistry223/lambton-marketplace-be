const jwt = require("jsonwebtoken");
const User = require("../model/user");
const { JWT_SECRET } = require("../secret_key");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({
      _id: decoded._id,
    });

    if (!user) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = auth;
