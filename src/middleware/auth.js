const jwt = require("jsonwebtoken");
const User = require("../model/user");
const { JWT_SECRET } = require("../secret_key");
const redis = require("redis");

const redisClient = redis.createClient();
redisClient.connect();

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded._id;

    const cachedUser = await redisClient.get(userId);
    if (cachedUser) {
      req.user = new User(JSON.parse(cachedUser));
      req.token = token;
      return next();
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: "Authentication failed" });
    }
    await redisClient.setEx(userId, 3600, JSON.stringify(user));
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = auth;
