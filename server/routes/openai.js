const express = require("express");
const OpenAI = require("openai");
const {handleChat} = require("../controllers/openai")
require("dotenv").config();

const router = express.Router();


// Health check
router.get("/", (req, res) => {
  res.json({ status: "OpenAI API is running!" });
});

// Main POST route for chatbot
router.post("/", handleChat);

module.exports = router;
