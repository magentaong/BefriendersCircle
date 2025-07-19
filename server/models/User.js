const mongoose = require("mongoose");
const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  cID: { type: String, unique: true }, // unique caregiver ID
  email: { type: String, required: true, unique: true, trim: true},
  password: { type: String, required: true, trim: true},
  name: {type: String, required: true,  trim: true},
  profileImg: {type: String},
  language: {type: String},
}, { timestamps: true });

// Auto-generate cID
userSchema.pre("save", function (next) {
  if (!this.cID) {
    this.cID = `caregiver_${nanoid(8)}`;
  }
  next();
});

// Hash password because we not naughty ppl
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
