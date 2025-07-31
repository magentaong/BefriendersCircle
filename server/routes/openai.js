const express = require("express");
const OpenAI = require("openai");
const Chat = require("../models/Chat");
const ResourceChat = require("../models/ResourceChat");
const parseChatbotReply = require("../utils/parseChatbotReply");
const { getResourceRetriever } = require("../langchain/resourceRetriever");
require("dotenv").config();

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Health check
router.get("/", (req, res) => {
  res.json({ status: "OpenAI API is running!" });
});

// Main POST route for chatbot
router.post("/", async (req, res) => {
  try {
    const { prompt, userId } = req.body;
    if (!prompt || !userId) {
      return res.status(400).json({ error: "Missing prompt or userId" });
    }

    console.log("[NEW REQUEST]", prompt);

    // 1. Retrieve relevant static resources using LangChain (Resource DB)
    let docs = [];
    try {
      const retriever = await getResourceRetriever();
      docs = await retriever.getRelevantDocuments(prompt);
    } catch (e) {
      console.warn("[LangChain Error]", e);
    }

    // Extract and format resource context
    const resourcesFromDB = docs.map((r) => ({
      title: r.metadata?.title || r.title || "Unnamed Resource",
      url: r.metadata?.url || r.url || "",
      category: r.metadata?.category || "General",
      tags: r.metadata?.tags || [],
    }));

    const resourceContext = resourcesFromDB
      .map((r, i) => `${i + 1}. ${r.title}: ${r.url}`)
      .join("\n");

    // 2. Construct full context prompt
    const fullPrompt = `
      You are a warm, empathetic caregiver assistant for Singapore seniors.
      Always refer to the following trusted resources and their links when answering:

      ${resourceContext || "No known resources found."}

      Always return your answer in the following JSON format:
      [
        {
          "title": "<scheme name>",
          "description": "<empathetic introduction + short scheme summary>",
          "eligibility": ["point 1", "point 2"],
          "steps": ["step 1", "step 2"],
          "link": "<official URL from above resources>",
          "category": "<Financial | Medical | General>",
          "tags": ["tag1", "tag2"]
        },
        ...
      ]
      User Question: ${prompt}
    `;

    console.log("[Prompt to OpenAI]:\n", fullPrompt);

    // 3. Create OpenAI thread & messages
    const thread = await openai.beta.threads.create();
    const threadId = thread.id;
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: fullPrompt,
    });

    // 4. Run assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: process.env.ASSISTANT_ID,
    });
    const runId = run.id;

    // 5. Poll until completion
    let runStatus;
    do {
      await new Promise((r) => setTimeout(r, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(runId, { thread_id: threadId });
      console.log("Polling:", runStatus.status);
    } while (runStatus.status !== "completed");

    // 6. Get assistant reply
    const messages = await openai.beta.threads.messages.list(threadId);
    const latestMessage = messages.data.find((msg) => msg.role === "assistant");
    const reply = latestMessage?.content[0]?.text?.value || "No response.";
    console.log("[OpenAI Reply Raw]", reply);

    // 7. Parse AI reply into multiple schemes
    const parsedResults = await parseChatbotReply(reply, resourcesFromDB.map((r) => r.url));
    const schemes = Array.isArray(parsedResults) ? parsedResults : (parsedResults ? [parsedResults] : []);

    // 8. Save each scheme into ResourceChat
    const savedSchemes = [];
    for (const scheme of schemes) {
      if (!scheme || !scheme.metadata) continue;

      let { title, link, description, tags, category, eligibility, steps, note } = scheme.metadata;

      // Validate link
      if (!link || !link.startsWith("http")) {
        link = resourcesFromDB[0]?.url || "https://www.lionsbefrienders.org.sg/";
      }

      // Clean up fields
      title = (title || "Untitled Resource").trim();
      description = (description || "").trim();
      tags = Array.isArray(tags) && tags.length > 0 ? tags : ["general"];
      category = category || "General";
      eligibility = Array.isArray(eligibility) ? eligibility.filter((e) => e.trim() !== "") : [];
      steps = Array.isArray(steps) ? steps.filter((s) => s.trim() !== "") : [];

      // Skip saving if data is incomplete
      if (!title || title.toLowerCase().includes("it's wonderful") || title.toLowerCase().includes("you're")) {
        console.log("[Skipped Saving] Invalid AI title:", title);
        continue;  // Skip saving
      }

      try {
        const existing = await ResourceChat.findOne({
          title: { $regex: `^${title}$`, $options: "i" },
        });

        if (!existing) {
          const newResource = await ResourceChat.create({
            title,
            description,
            eligibility,
            steps,
            link,
            tags,
            category,
            source: "Chatbot AI",
            note: note || "",
          });
          console.log("[New Chat Resource Saved]:", title);
          savedSchemes.push(newResource);
        } else {
          console.log("[Skipped Saving] Duplicate resource detected:", title);
          savedSchemes.push(existing);
        }
      } catch (e) {
        if (e.code === 11000) {
          console.log("[Skipped Saving] Duplicate title (MongoDB unique index):", title);
        } else {
          console.error("[DB Error] Failed to save chat resource:", e);
        }
      }
    }

    // 9. Save chat history (use first scheme's description)
    const firstScheme = schemes[0]?.metadata;
    const chatContent = firstScheme?.description?.replace(/```json|```/gi, "").trim() || reply;
    await Chat.create({ userId, role: "user", content: prompt });
    await Chat.create({ userId, role: "assistant", content: chatContent });

    // 10. Deduplicate schemes by title and return
    const allSchemesRaw = [...schemes.map(s => s.metadata), ...savedSchemes];

    const uniqueSchemes = [
      ...new Map(
        allSchemesRaw
          .filter(s => s && s.title)
          .map(s => [s.title.trim().toLowerCase(), s]) // normalize
      ).values()
    ];

    res.json({
      reply: chatContent,
      verifiedResource: uniqueSchemes[0] || null,
      relatedSchemes: uniqueSchemes
    });

  } catch (error) {
    console.error("[OpenAI API Error]:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;
