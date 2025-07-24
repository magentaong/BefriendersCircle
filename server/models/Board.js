const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const boardSchema = new mongoose.Schema({
  bID: { type: String, unique: true },
  cID: { type: String, required: true }, // caregiver/user who created
  category: {type: String, required: true},
  name: { type: String, required: true },
  coverImg: { type: String }
}, { timestamps: true });


// Auto-generate bID if not provided
boardSchema.pre("save", function (next) {
  console.log("⚡ Pre-save hook triggered");
  console.log("Before:", this.bID);
  if (!this.bID) {
    console.log("No bID found, generating...");
    this.bID = `board_${nanoid(8)}`;
  }
  console.log("After:", this.bID);
  next();
});

module.exports = mongoose.model("Board", boardSchema);
