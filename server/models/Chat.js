const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "chats" }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;