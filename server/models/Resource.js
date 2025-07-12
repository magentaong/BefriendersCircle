// models/Resource.js
const mongoose = require("mongoose");

const ResourceSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
  category: String,
  tags: [String],
  source: String,
  isVerified: Boolean,
}, { timestamps: true });

module.exports = mongoose.model("Resource", ResourceSchema);
