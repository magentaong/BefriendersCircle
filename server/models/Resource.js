// models/Resource.js
const mongoose = require("mongoose");
const { nanoid } = require("nanoid");
/*Hi guys, example of how I'm hoping to store the data: 
Title: Caregiver Training Grant
Category: Finance
Tags: ["grant", "training", "MOH"]
URL: blah blah blah
Description: yankee doodle
Source: MOH
*/
const ResourceSchema = new mongoose.Schema({
  rID: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String, //not necesary
  category: { type: String, required: true },
  subcategory: String,//not necesary
  tags: [String],//not necesary but highly reccomended
  url: { type: String, required: true },
  source: String, //not necesary
  isVerified: { type: Boolean, default: true },
  likes: { type: Number, default: 0 }
}, { timestamps: true });

// Auto-generate rID if missing
ResourceSchema.pre("save", function (next) {
  if (!this.rID) {
    this.rID = `res_${nanoid(8)}`;  // e.g., res_8f2kdj4a
  }
  next();
});


module.exports = mongoose.model("Resource", ResourceSchema);
