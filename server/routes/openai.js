const express = require("express");
const OpenAI = require("openai");
require("dotenv").config();

const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.get("/", (req, res) => {
  res.json({ status: "OpenAI API is running!" });
});

router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    console.log('[NEW REQUEST]', prompt);

    const thread = await openai.beta.threads.create();
    const threadId = thread.id;
    console.log('Thread ID:', threadId, '| Thread obj:', thread);

    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: prompt,
    });

    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: process.env.ASSISTANT_ID,
    });
    const runId = run.id;
    console.log('Run ID:', runId, '| Run obj:', run);

    let runStatus;
    do {
      await new Promise(r => setTimeout(r, 1000));
      console.log("threadId:", threadId);
      console.log("runId:", runId);
      runStatus = await openai.beta.threads.runs.retrieve(runId, {
        thread_id: threadId
      });

      console.log("Polling:", runStatus.status, '| runId:', runId, '| threadId:', threadId);
    } while (runStatus.status !== "completed");

    const messages = await openai.beta.threads.messages.list(threadId);
    const latestMessage = messages.data.find(msg => msg.role === "assistant");

    res.json({ reply: latestMessage?.content[0]?.text?.value ?? "No response." });

  } catch (error) {
    console.error("OpenAI Assistants API error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
