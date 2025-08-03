const OpenAI = require("openai");
const Chat = require("../models/Chat");
const ResourceChat = require("../models/ResourceChat");
const parseChatbotReply = require("../utils/parseChatbotReply");
const { getResourceRetriever } = require("../langchain/resourceRetriever");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getRelevantDocs(prompt) {
  try {
    console.log("[LangChain] Retrieving resources for prompt:", prompt);
    const retriever = await getResourceRetriever();
    const docs = await retriever.getRelevantDocuments(prompt);
    console.log("[LangChain] Retrieved documents count:", docs.length);
    console.log("[LangChain] Documents:", JSON.stringify(docs, null, 2));
    return docs
  } catch (e) {
    console.warn("[LangChain Error]", e);
    return [];
  }
}

function buildPrompt(userPrompt, docs) {
  const context = docs.map((r, i) => `${i + 1}. ${r.metadata?.title || r.title}: ${r.metadata?.url || r.url}`).join("\n");
  const fullPrompt = `
    You are a warm, empathetic caregiver assistant for Singapore seniors.
    Always refer to the following trusted resources and their links when answering:

    ${context || "No known resources found."}

    Always return your answer in the following JSON format:
    [
      {
        "title": "<scheme name>",
        "description": "...",
        "eligibility": [...],
        "steps": [...],
        "link": "...",
        "category": "...",
        "tags": [...]
      }
    ]

    User Question: ${userPrompt}
  `;
  console.log("[LangChain] Constructed fullPrompt:\n", fullPrompt);
  return fullPrompt;
}

async function runOpenAIChat(prompt) {
  const thread = await openai.beta.threads.create();
  const threadId = thread.id;

  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: prompt,
  });
  console.log("Thread ID:", threadId);
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: process.env.ASSISTANT_ID,
  });
  console.log("Run ID:", run.id);

  let status;
  do {
    await new Promise((r) => setTimeout(r, 1000));
    status = await openai.beta.threads.runs.retrieve(run.id, { thread_id: threadId });
    console.log("Polling:", status.status);
  } while (status.status !== "completed");

  const messages = await openai.beta.threads.messages.list(threadId);
  const assistant = messages.data.find((m) => m.role === "assistant");
  const reply = assistant?.content[0]?.text?.value || "No response.";
  console.log("[OpenAI Reply]", reply);
  return reply
}

function extractReply(parsedSchemes, fallback) {
  return parsedSchemes?.[0]?.metadata?.description?.replace(/```json|```/gi, "").trim() || fallback;
}

async function parseReply(reply, knownUrls) {
  const parsed = await parseChatbotReply(reply, knownUrls);
  return Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
}

async function saveSchemesToDB(schemes, docs) {
  const saved = [];
  for (const scheme of schemes) {
    if (!scheme?.metadata?.title) continue;

    let { title, link, description, tags, category, eligibility, steps, note } = scheme.metadata;
    if (!link || !link.startsWith("http")) {
      link = docs[0]?.metadata?.url || "https://www.lionsbefrienders.org.sg/";
    }

    try {
      const existing = await ResourceChat.findOne({ title: { $regex: `^${title}$`, $options: "i" } });
      if (!existing) {
        const newResource = await ResourceChat.create({
          title: title.trim(),
          description: description?.trim(),
          eligibility,
          steps,
          link,
          tags: tags?.length ? tags : ["general"],
          category: category || "General",
          source: "Chatbot AI",
          note: note || "",
        });
        saved.push(newResource);
      } else {
        saved.push(existing);
      }
    } catch (e) {
      console.warn("[DB Error] Skipping save:", e.message);
    }
  }
  return saved;
}

async function saveChatHistory(userId, prompt, replyText) {
  await Chat.create({ userId, role: "user", content: prompt });
  await Chat.create({ userId, role: "assistant", content: replyText });
}

function deduplicateSchemes(schemes) {
  return [...new Map(
    schemes.filter(s => s?.title).map(s => [s.title.trim().toLowerCase(), s])
  ).values()];
}


async function handleChat(req, res) {
  try {
    const { prompt, userId } = req.body;
    if (!prompt || !userId) {
      return res.status(400).json({ error: "Missing prompt or userId" });
    }

    const docs = await getRelevantDocs(prompt);
    const promptString = buildPrompt(prompt, docs);
    const replyRaw = await runOpenAIChat(promptString);
    const parsedSchemes = await parseReply(replyRaw, docs.map(d => d.url));
    const savedSchemes = await saveSchemesToDB(parsedSchemes, docs);
    const replyText = extractReply(parsedSchemes, replyRaw);
    await saveChatHistory(userId, prompt, replyText);

    const allSchemes = deduplicateSchemes([...parsedSchemes.map(s => s.metadata), ...savedSchemes]);

    res.json({
      reply: replyText,
      verifiedResource: allSchemes[0] || null,
      relatedSchemes: allSchemes,
    });

  } catch (err) {
    console.error("[OpenAI API Error]:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = {getRelevantDocs, buildPrompt, runOpenAIChat, extractReply, parseReply,saveSchemesToDB,saveChatHistory, deduplicateSchemes, handleChat };
