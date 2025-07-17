const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // or phoneNumber if using phone
  threadId: { type: String },
  lastInteraction: { type: Date },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
