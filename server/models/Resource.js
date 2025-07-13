// models/Resource.js
const mongoose = require("mongoose");

/*Hi guys, example of how I'm hoping to store the data: 
Title: Caregiver Training Grant
Category: Finance
Tags: ["grant", "training", "MOH"]
URL: blah blah blah
Description: yankee doodle
Source: MOH
*/
const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String, //not necesary
  category: { type: String, required: true },
  subcategory: String,//not necesary
  tags: [String],//not necesary but highly reccomended
  url: { type: String, required: true },
  source: String, //not necesary
  isVerified: { type: Boolean, default: true },
}, { timestamps: true });


export default mongoose.model("Resource", ResourceSchema); //Idk if we use 
