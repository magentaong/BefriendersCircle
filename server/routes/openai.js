const express = require("express");
const OpenAI = require("openai");
const Chat = require("../models/Chat");
const { getResourceRetriever } = require("../langchain/resourceRetriever");
require("dotenv").config();

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Health check route
router.get("/", (req, res) => {
  res.json({ status: "OpenAI API is running!" });
});

router.post("/", async (req, res) => {
  try {
    const { prompt, userId } = req.body;
    if (!prompt || !userId)
      return res.status(400).json({ error: "Missing prompt or userId" });

    console.log("[NEW REQUEST]", prompt);

    // 1. Retrieve relevant resources using LangChain
    console.log("[LangChain] Retrieving resources for prompt:", prompt);
    const retriever = await getResourceRetriever();

    const docs = await retriever.getRelevantDocuments(prompt);
    console.log("[LangChain] Retrieved documents count:", docs.length);
    console.log("[LangChain] Documents:", JSON.stringify(docs, null, 2));

    // Ensure safe access to metadata
    const context = docs
      .map((d) => `${d.metadata?.title || "Untitled"}: ${d.metadata?.url || ""}`)
      .join("\n");

    // 2. Construct full prompt with context
    const fullPrompt = `User asked: ${prompt}\nRelevant resources:\n${context}`;
    console.log("[LangChain] Constructed fullPrompt:\n", fullPrompt);

    // 3. Create a new OpenAI thread
    const thread = await openai.beta.threads.create();
    const threadId = thread.id;
    console.log("Thread ID:", threadId);

    // 4. Add user message (with context) to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: fullPrompt,
    });

    // 5. Create a run for the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: process.env.ASSISTANT_ID,
    });
    const runId = run.id;
    console.log("Run ID:", runId);

    // 6. Poll until run is completed
    let runStatus;
    do {
      await new Promise((r) => setTimeout(r, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(runId, {
        thread_id: threadId,
      });
      console.log("Polling:", runStatus.status);
    } while (runStatus.status !== "completed");

    // 7. Retrieve assistant's reply
    const messages = await openai.beta.threads.messages.list(threadId);
    const latestMessage = messages.data.find((msg) => msg.role === "assistant");
    const reply = latestMessage?.content[0]?.text?.value || "No response.";
    console.log("[OpenAI Reply]", reply);

    // 8. Respond with both AI reply and matched resources
    res.json({ reply, resources: docs });

    // 9. Save chat messages to MongoDB
    await Chat.create({ userId, role: "user", content: prompt });
    await Chat.create({ userId, role: "assistant", content: reply });
    console.log("[Chat Saved] Messages stored for userId:", userId);

  } catch (error) {
    console.error("OpenAI Assistants API error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;
