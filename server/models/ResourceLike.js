const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const resourceLikeSchema = new mongoose.Schema({
  rLID: { type: String, required: true, unique: true },
  rID: { type: String, required: true },   // ID of the resource being liked
  cID: { type: String, required: true },   // ID of the caregiver/user who liked
  isLiked: { type: Boolean, default: true }
}, { timestamps: true });

// Auto-generate rLID if not provided
resourceLikeSchema.pre("save", function (next) {
  if (!this.rLID) {
    this.rLID = `rL_${nanoid(8)}`;   // e.g., "rL_ab12CD34"
  }
  next();
});

module.exports = mongoose.model("ResourceLike", resourceLikeSchema);
