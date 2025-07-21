const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const boardSchema = new mongoose.Schema({
  bID: { type: String, required: true, unique: true },
  cID: { type: String, required: true }, // caregiver/user who created
  category: {type: String, required: true},
  name: { type: String, required: true },
  coverImg: { type: String }
}, { timestamps: true });


// Auto-generate bID if not provided
boardSchema.pre("save", function (next) {
  if (!this.bID) {
    this.bID = `board_${nanoid(8)}`; 
  }
  next();
});

module.exports = mongoose.model("Board", boardSchema);
