const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Use environment variable or fallback to local MongoDB
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/befrienderscircle";
    console.log("Attempting to connect to MongoDB...");
    
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    console.log("Server will continue without database connection");
  }
};

module.exports = connectDB;
