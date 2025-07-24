const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

// datetime no need :>
const postSchema = new mongoose.Schema({
  pID: { type: String, unique: true },
  bID: {type: String, required: true}, // under the board
  cID: { type: String, required: true }, // caregiver/user who created
  message: { type: String, required: true},
  comments: { type: Number, default: 0},
  likes: { type: Number, default: 0},
}, { timestamps: true });


// Auto-generate pID if not provided
postSchema.pre("save", function (next) {
  if (!this.pID) {
    this.pID = `post_${nanoid(8)}`; 
  }
  next();
});

module.exports = mongoose.model("Post", postSchema);
