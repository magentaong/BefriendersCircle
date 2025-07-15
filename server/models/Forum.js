// models/Forum.js
const mongoose = require("mongoose");

/*Hi guys, example of how I'm hoping to store the data: 
Title: Fatigue
Category: Topics
URL: blah blah blah (of image)
*/
const ForumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  url: { type: String, required: true },
  isVerified: { type: Boolean, default: true },
}, { timestamps: true });


export default mongoose.model("Forum", ForumSchema);
