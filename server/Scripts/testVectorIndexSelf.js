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
    console.error("No document with embedding found!");
    process.exit(1);
  }

  console.log("Using embedding from:", sample.title);
  console.log("Embedding length:", sample.embedding.length);

  const results = await collection.aggregate([
    {
      $vectorSearch: {
        queryVector: sample.embedding,
        path: "embedding",
        numCandidates: 100,
        limit: 5,
        index: "resource_index"
      }
    }
  ]).toArray();

  console.log("Vector search results:", JSON.stringify(results, null, 2));
  await client.close();
})();
