// Not really used (but chats are still saved), LangChain is only used for document retrieval now since Assistants API has it's own conversation management
// Used only for backup/analytics store
// LangChain retrieves chat history from db and constructs a prompt with context, updating memory
// Helps with prompt engineering as it constructs prompts with conversation history

const mongoose = require("mongoose"); // Connect to MongoDB
const Chat = require("../models/Chat.js"); // Import Chat model for storing conversation history in database

const { ChatOpenAI } = require("@langchain/openai");
const { BufferMemory } = require("langchain/memory"); // Memory management for converssations
const { MongoDBChatMessageHistory } = require("@langchain/mongodb"); // MongoDB-backed chat history
const { ConversationChain } = require("langchain/chains"); 

// Create MongoDB-backed memory for a specific user, persistent chat history tied to their session
const getMongoDBMemory = (userId) =>
  new MongoDBChatMessageHistory({
    collection: mongoose.connection.collection("chats"),
    sessionId: userId,
  });

// Persistent memory
async function handleLangChainChat(userId, prompt) {
  if (!userId || !prompt) {
    const err = new Error("Missing userId or prompt");
    err.status = 400;
    throw err;
  }

  // User chat history
  const chatHistory = getMongoDBMemory(userId);

  // Init OpenAI model
  const llm = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.2, // Less creative responses
  });

  // Memory buffer to manage conversation content
  const memory = new BufferMemory({
    chatHistory, // Use MongoDB history for persistence
    memoryKey: "chat_history", // Accessing history in prompts
    returnMessages: true,
  });

  // Conversation chain that combines LLM, memory and conversation
  const chain = new ConversationChain({ 
    llm, // AI to generate response
    memory, // Maintain conversation context
    verbose: true,
  });

  const response = await chain.call({ input: prompt });
  // Redundant as resources are saved and verified
  await Chat.create({ userId, role: "user", content: prompt });
  await Chat.create({ userId, role: "assistant", content: response.response });

  return response.response;
}

module.exports = { handleLangChainChat };
