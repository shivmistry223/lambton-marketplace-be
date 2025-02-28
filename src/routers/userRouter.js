const express = require("express");
const User = require("../model/user");
const router = new express.Router();
const bcrypt = require("bcrypt");
const sgMail = require("@sendgrid/mail");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

const {
  SENDGRID_API_KEY,
  JWT_SECRET,
  LAMBTON_FE,
  SENDER_EMAIL,
} = require("../secret_key");

sgMail.setApiKey(SENDGRID_API_KEY);

router.post("/register", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post("/forgot-password", async (req, res) => {
  const { userName } = req.body;
  const user = await User.findOne({ userName });

  if (!user) return res.status(400).json({ message: "User not found" });

  const token = jwt.sign({ userName }, JWT_SECRET, {
    expiresIn: "15m",
  });
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save();

  const resetLink = `${LAMBTON_FE}/reset-password/${token}`;

  const msg = {
    to: userName,
    from: SENDER_EMAIL,
    subject: "Password Reset Request",
    html: `
      <p>You requested a password reset.</p>
      <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
      <p>This link expires in 15 minutes.</p>
    `,
  };

  try {
    await sgMail.send(msg);
    res.json({ message: "Reset link sent to email" });
  } catch (error) {
    console.error("SendGrid Error:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({
      userName: decoded.userName,
    });

    if (!user || user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = password;
    user.resetToken = "";
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.log(error, "error");
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

router.post("/logout", auth, async (req, res) => {
  try {
    const user = req.user;
    const token = req.token;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    user.tokens = user.tokens.filter((t) => t.token !== token);
    await user.save();

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.userName,
      req.body.password
    );
    const token = await user.getAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get("/user/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.put("/user", async (req, res) => {
  const allowableUpdates = [
    "firstName",
    "lastName",
    "courseCode",
    "termNo",
    "phoneNumber",
  ];

  try {
    const user = await User.findById(req.body.id);
    allowableUpdates.forEach((key) => (user[key] = req.body[key]));
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.post("/reset-password", async (req, res) => {
  const { id, oldPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).send("Passwords do not match!");
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send("User not found!");
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);

    if (!isValid) {
      throw new Error("Invalid Password");
    }

    user.password = newPassword;

    await user.save();
    res.send(true);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


module.exports = router;
