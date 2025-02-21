const express = require("express");
const User = require("../model/user");
const router = new express.Router();
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
  console.log(req.body);
  const user = new User(req.body);
  try {
    await user.save();
    res.send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
