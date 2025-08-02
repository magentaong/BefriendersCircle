const express = require("express");
const router = express.Router();
const { handleLangChainChat } = require("../controllers/langchain");

router.post("/", async (req, res) => {
  const { userId, prompt } = req.body;

  try {
    const reply = await handleLangChainChat(userId, prompt);
    res.json({ reply });
  } catch (err) {
    console.error("LangChain chat error:", err);
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
