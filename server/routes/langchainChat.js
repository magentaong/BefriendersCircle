const express = require("express");
const router = express.Router();
const { handleLangChainChat } = require("../controllers/langchainChat");

router.post("/", async (req, res) => {
  const { userId, prompt } = req.body; 

  try {
    // Call LangChain controller to process conversation
    const reply = await handleLangChainChat(userId, prompt);
    res.json({ reply });
  } catch (err) {
    console.error("LangChain chat error:", err);
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
