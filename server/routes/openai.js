const express = require("express");
const OpenAI = require("openai");
const Chat = require("../models/Chat");
require("dotenv").config();

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.get("/", (req, res) => {
  res.json({ status: "OpenAI API is running!" });
});

router.post("/", async (req, res) => {
  try {
    const { prompt, userId } = req.body;
    if (!prompt || !userId)
      return res.status(400).json({ error: "Missing prompt or userId" });

    console.log('[NEW REQUEST]', prompt);

    // Create new thread
    const thread = await openai.beta.threads.create();
    const threadId = thread.id;
    console.log('Thread ID:', threadId, '| Thread obj:', thread);

    // Add user's message to thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: prompt,
    });

    // Create a run for this assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: process.env.ASSISTANT_ID,
    });
    const runId = run.id;
    console.log('Run ID:', runId, '| Run obj:', run);

    // Poll until run is complete
    let runStatus;
    do {
      await new Promise(r => setTimeout(r, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
      console.log("Polling:", runStatus.status, '| runId:', runId, '| threadId:', threadId);
    } while (runStatus.status !== "completed");

    // Get assistant's reply
    const messages = await openai.beta.threads.messages.list(threadId);
    const latestMessage = messages.data.find(msg => msg.role === "assistant");
    const reply = latestMessage?.content[0]?.text?.value ?? "No response.";

    // Respond to user immediately (avoid double response bug)
    res.json({ reply });

    // Save both user and assistant messages to MongoDB
    await Chat.create({ userId, role: "user", content: prompt });
    await Chat.create({ userId, role: "assistant", content: reply });

  } catch (error) {
    console.error("OpenAI Assistants API error:", error);
    // Only send an error response if one wasn't already sent
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;
