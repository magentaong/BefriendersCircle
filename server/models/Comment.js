const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

// datetime no need :>
const commentSchema = new mongoose.Schema({
  pID: { type: String, required: true}, //under pID
  commID: {type: String, unique: true}, 
  cID: { type: String, required: true }, // caregiver/user who created
  message: { type: String, required: true},
  likes: { type: Number, default: 0},
}, { timestamps: true });


// Auto-generate cID if not provided
commentSchema.pre("save", function (next) {
  if (!this.commID) {
    this.commID = `comm_${nanoid(8)}`; 
  }
  next();
});

module.exports = mongoose.model("Comment", commentSchema);
