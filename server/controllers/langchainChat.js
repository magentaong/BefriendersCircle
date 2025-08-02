const mongoose = require("mongoose");
const Chat = require("../models/Chat.js");

const { ChatOpenAI } = require("@langchain/openai");
const { BufferMemory } = require("langchain/memory");
const { MongoDBChatMessageHistory } = require("langchain/stores/message/mongodb");
const { ConversationChain } = require("langchain/chains");

const getMongoDBMemory = (userId) =>
  new MongoDBChatMessageHistory({
    collection: mongoose.connection.collection("chats"),
    sessionId: userId,
  });

async function handleLangChainChat(userId, prompt) {
  if (!userId || !prompt) {
    const err = new Error("Missing userId or prompt");
    err.status = 400;
    throw err;
  }

  const chatHistory = getMongoDBMemory(userId);

  const llm = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.2,
  });

  const memory = new BufferMemory({
    chatHistory,
    memoryKey: "chat_history",
    returnMessages: true,
  });

  const chain = new ConversationChain({
    llm,
    memory,
    verbose: true,
  });

  const response = await chain.call({ input: prompt });

  await Chat.create({ userId, role: "user", content: prompt });
  await Chat.create({ userId, role: "assistant", content: response.response });

  return response.response;
}

module.exports = { handleLangChainChat };
