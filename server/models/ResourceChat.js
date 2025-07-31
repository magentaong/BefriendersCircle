const mongoose = require("mongoose");

const ResourceChatSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true }, 
    description: { type: String, required: true },
    eligibility: { type: [String], default: [] }, 
    steps: { type: [String], default: [] },       
    link: { type: String, default: "" },          
    category: { type: String, default: "General" },
    tags: { type: [String], default: [] },
    source: { type: String, default: "Chatbot AI" },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ResourceChat", ResourceChatSchema);
