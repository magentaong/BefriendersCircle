const express = require("express");
const OpenAI = require("openai");
// Import OpenAI chat controller with RAG functionality
const {handleChat} = require("../controllers/openai")
require("dotenv").config();

const router = express.Router();


// Health check
router.get("/", (req, res) => {
  res.json({ status: "OpenAI API is running!" });
});

// Main POST route for chatbot
router.post("/", handleChat); // Vector search to prompt building and response processing

module.exports = router;
