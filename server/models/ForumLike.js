const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const forumLikeSchema = new mongoose.Schema({

  fLID: { type: String, unique: true },

  forumID: { type: String, required: true },    // ID of the post or comment being liked
  cID: { type: String, required: true },        // ID of the caregiver/user who liked
  isPost: { type: Boolean, required: true },    // true if forumID refers to a Post, false if it's a Comment
  isLiked: { type: Boolean, default: true }
}, { timestamps: true });

// Auto-generate fLID if not provided
forumLikeSchema.pre("save", function (next) {
  if (!this.fLID) {
    this.fLID = fL_${nanoid(8)};   // e.g., "fL_ab12CD34"

  }
  next();
});


module.exports = mongoose.model("ForumLike", forumLikeSchema);

