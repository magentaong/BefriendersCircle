// Testing for whether the embedding works, and to find similar documents
// Troubleshooting if no embeddings are found, no resource index or empty results
require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.MONGO_URI;
const dbName = "Befrienders";
const collectionName = "resources";

(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const collection = client.db(dbName).collection(collectionName);

  // Get embedding of first resource
  const sample = await collection.findOne({ embedding: { $exists: true } });
  if (!sample) {
    // Exit if no embedded documents found
    console.error("No document with embedding found!");
    process.exit(1);
  }

  // Log information about sample document
  console.log("Using embedding from:", sample.title);
  console.log("Embedding length:", sample.embedding.length);

  // Vector similarity search using MongoDB Atlas Vector Search
  const results = await collection.aggregate([
    {
      $vectorSearch: {
        queryVector: sample.embedding, // Sample embedding as search query
        path: "embedding", // Vector embeddings
        numCandidates: 100, // Number of candidates to consider
        limit: 5, // Return top 5
        index: "resource_index"
      }
    }
  ]).toArray();

  console.log("Vector search results:", JSON.stringify(results, null, 2));
  await client.close();
})();
