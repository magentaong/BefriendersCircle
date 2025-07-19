const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already in use" });

    const newUser = new User({ email, password, name });
    await newUser.save();

    const token = jwt.sign({ cID: newUser.cID }, process.env.JWT_SECRET, { expiresIn: "2h" });
    const isOnboarded = !!(newUser.name && newUser.language);

    res.status(201).json({
        token,
        cID: newUser.cID,
        isOnboarded,
    });

  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ cID: user.cID }, process.env.JWT_SECRET, { expiresIn: "2h" });

    const isOnboarded = !!(user.name && user.language);

    res.json({
        token,
        cID: user.cID,
        isOnboarded,
    });

  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

const authMiddleware = require("../middleware/auth");

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ cID: req.user.cID }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to get user", error: err.message });
  }
});

// PATCH /api/auth/me so that we can update profile :O 
// PATCH /api/auth/me
router.patch("/me", authMiddleware, async (req, res) => {
  try {
    const { language, name, profileImg } = req.body;

    const updated = await User.findOneAndUpdate(
      { cID: req.user.cID },
      { $set: { language, name, profileImg } },
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated", user: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user", error: err.message });
  }
});


module.exports = router;
