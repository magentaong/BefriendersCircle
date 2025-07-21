const mongoose = require("mongoose");


const trainingSchema = new mongoose.Schema({
  tID: { type: String, required: true, unique: true },
  cID: { type: String, required: true }, //caregiver who started the training
  title: { type: String, required: true },
  coverImg: { type: String }, // putting coverImg here just in case we need it :> 
  status: { type: Boolean, default: false},
  progress: { type: Number, default: 0, min: 0, max: 100},
}, { timestamps: true }); //btw i'm putting timestamp true for all cause i think good to have hehe


module.exports = mongoose.model("Training", trainingSchema);
