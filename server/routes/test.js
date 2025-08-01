const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.delete("/cleanup", async (req, res) => {
  try {
    await User.deleteOne({ email: "testuser@example.com" });
    await User.deleteOne({ email: "testuser1@example.com" });
    await User.deleteOne({ email: "testuser2@example.com" });
    res.status(200).send("Test users deleted");
  } catch (err) {
    res.status(500).send("Cleanup failed");
  }
});

module.exports = router;
