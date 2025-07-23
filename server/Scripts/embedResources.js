const mongoose = require("mongoose");
const { generateResourceEmbeddings } = require("../langchain/resourceVectorstore");

require("dotenv").config();

(async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, { dbName: "Befrienders" });
    console.log("Connected to MongoDB");

    // Generate embeddings
    await generateResourceEmbeddings();

    console.log("All resources embedded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error embedding resources:", err);
    process.exit(1);
  }
})();
