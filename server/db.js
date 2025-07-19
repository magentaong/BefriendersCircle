const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("MONGO_URI from .env is:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};

module.exports = connectDB;
