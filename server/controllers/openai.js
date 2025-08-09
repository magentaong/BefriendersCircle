// LangChain uses semantic search system, embeddings to find relevant documents
// Uses Retrieval-Augmented Generation to retrieve documents, include prompt and context to ground responses

const OpenAI = require("openai");
// Database models to store chat history and resources
const Chat = require("../models/Chat");
const ResourceChat = require("../models/ResourceChat");

// Utility to parsing AI responses
const parseChatbotReply = require("../utils/parseChatbotReply");
const { getResourceRetriever } = require("../langchain/resourceRetriever");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Function to retrieve documents using LangChain
async function getRelevantDocs(prompt) {
  try {
    // LangChain retriever, vector store/similarity search
    console.log("[LangChain] Retrieving resources for prompt:", prompt);
    
    // LangChain to find relevant documents to user's prompt, using embedding/vector similarity
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

// Construct prompt with retrieved context documents
function buildPrompt(userPrompt, docs) {
  // Documents as numbered list with titles and URLs
  const context = docs.map((r, i) => `${i + 1}. ${r.metadata?.title || r.title}: ${r.metadata?.url || r.url}`).join("\n");
  // Prompt Engineering (more on the openai dev platform)
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

// Interact with Assistants API (not simple chat API)
async function runOpenAIChat(prompt) {
  // Create conversation thread
  const thread = await openai.beta.threads.create();
  const threadId = thread.id;

  // Add user's message to thread
  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: prompt,
  });

  // Run with assistant
  console.log("Thread ID:", threadId);
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: process.env.ASSISTANT_ID,
  });
  console.log("Run ID:", run.id);

  // Polling for completion
  let status;
  do {
    await new Promise((r) => setTimeout(r, 1000)); // Wait a second between polls
    status = await openai.beta.threads.runs.retrieve(run.id, { thread_id: threadId });
    console.log("Polling:", status.status);
  } while (status.status !== "completed");

  // Retrieve assistant's response from thread
  const messages = await openai.beta.threads.messages.list(threadId);
  const assistant = messages.data.find((m) => m.role === "assistant");
  const reply = assistant?.content[0]?.text?.value || "No response.";
  console.log("[OpenAI Reply]", reply);
  return reply
}

// Extract fallback reply from parsed schemes
function extractReply(parsedSchemes, fallback) {
  // Description from first scheme, cleanup markdown, as AI returns in markdown and json
  return parsedSchemes?.[0]?.metadata?.description?.replace(/```json|```/gi, "").trim() || fallback;
}

// Parse AI response into structured objects
async function parseReply(reply, knownUrls) {
  const parsed = await parseChatbotReply(reply, knownUrls); // Utility function 
  return Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
}

// Save AI-generated schemes to database
async function saveSchemesToDB(schemes, docs) {
  const saved = [];
  // Process each scheme
  for (const scheme of schemes) {
    if (!scheme?.metadata?.title) continue; // Skip schemes without titles

    // Extract properties
    let { title, link, description, tags, category, eligibility, steps, note } = scheme.metadata;
    if (!link || !link.startsWith("http")) {
      link = docs[0]?.metadata?.url || "https://www.lionsbefrienders.org.sg/"; // Fallback link
    }

    try { // Check if scheme is pre-existing (case-sensitive)
      const existing = await ResourceChat.findOne({ title: { $regex: `^${title}$`, $options: "i" } });
      if (!existing) {
        // Create new resource if it does not exist 
        const newResource = await ResourceChat.create({
          title: title.trim(),
          description: description?.trim(),
          eligibility,
          steps,
          link,
          tags: tags?.length ? tags : ["general"], // Default tag
          category: category || "General", // Default category
          source: "Chatbot AI", // Mark as AI-generated
          note: note || "", // For AI-generated, but no verification from database
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

// Save chat interaction to database
async function saveChatHistory(userId, prompt, replyText) {
  await Chat.create({ userId, role: "user", content: prompt });
  await Chat.create({ userId, role: "assistant", content: replyText });
}

// Remove duplicate schemes based on title
function deduplicateSchemes(schemes) {
  return [...new Map( // Include schemes only with titles
    schemes.filter(s => s?.title).map(s => [s.title.trim().toLowerCase(), s]) // Lowercase title deduplication key
  ).values()];
}

// API handler for chat requests
async function handleChat(req, res) {
  try {
    // Check for required parameters
    const { prompt, userId } = req.body;
    if (!prompt || !userId) {
      return res.status(400).json({ error: "Missing prompt or userId" });
    }

    // Use LangChain to retrieve relevant documents from resources
    const docs = await getRelevantDocs(prompt);
    // Build prompt with context
    const promptString = buildPrompt(prompt, docs);
    // Get raw AI response
    const replyRaw = await runOpenAIChat(promptString);
    // Parse AI response into structured schemes, verify with database
    const parsedSchemes = await parseReply(replyRaw, docs.map(d => d.url));
    // Save new schemes to database
    const savedSchemes = await saveSchemesToDB(parsedSchemes, docs);
    // Extract reply
    const replyText = extractReply(parsedSchemes, replyRaw);
    // Save chat history
    await saveChatHistory(userId, prompt, replyText);

    // Combine and deduplicate all schemes
    const allSchemes = deduplicateSchemes([...parsedSchemes.map(s => s.metadata), ...savedSchemes]);

    // Return structured response to frontend
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
