const express = require("express");
const User = require("../models/User");
const { registerUser, loginUser, getUserProfile, updateProfile, deleteAccount } = require("../controllers/auth")
const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message ||  "Registration failed", error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const result = await loginUser(req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Login failed", error: err.message });
  }
});

const authMiddleware = require("../middleware/auth");

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const result =  await getUserProfile(req.user.cID);
    res.json(result)
  } catch (err) {
    res.status(err.status || 500).json({ message: "Failed to get user", error: err.message });
  }
});

// PATCH /api/auth/me so that we can update profile :O 
router.patch("/me", authMiddleware, async (req, res) => {
  try {
    const result = await updateProfile(req.user.cID, req.body);
    res.json({ message: "User updated", user: result });
  } catch (err) {
    res.status(err.status ||500 ).json({ message: "Failed to update user", error: err.message });
  }
});

// DELETE /api/auth/me to allow users to delete their own accounts
router.delete("/me", authMiddleware, async (req, res) => {
  try {
    await deleteAccount(req.user.cID);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(err.status || 500 ).json({ message: "Failed to delete account", error: err.message });
  }
});


module.exports = router;

