const express = require("express");
const mongoose = require("mongoose");
const Chat = require("../models/Chat.js");

// Import only from the correct CommonJS-compatible submodules
const { ChatOpenAI } = require("@langchain/openai");

const router = express.Router();

// Helper to get message memory using MongoDB
const getMongoDBMemory = (userId) =>
  new MongoDBChatMessageHistory({
    collection: mongoose.connection.collection("chats"),
    sessionId: userId,
  });

router.post("/", async (req, res) => {
  const { userId, prompt } = req.body;
  if (!userId || !prompt)
    return res.status(400).json({ error: "Missing userId or prompt" });

  try {
    // Set up chat memory for this user
    const chatHistory = getMongoDBMemory(userId);

    // Create LLM instance
    const llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0.2,
    });

    // LangChain memory
    const memory = new BufferMemory({
      chatHistory,
      memoryKey: "chat_history",
      returnMessages: true,
    });

    // Set up conversation chain
    const chain = new ConversationChain({
      llm,
      memory,
      verbose: true,
    });

    // Generate response
    const response = await chain.call({ input: prompt });

    // Save user and assistant messages to MongoDB
    await Chat.create({ userId, role: "user", content: prompt });
    await Chat.create({ userId, role: "assistant", content: response.response });

    res.json({ reply: response.response });
  } catch (err) {
    console.error("LangChain chat error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
