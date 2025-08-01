require("dotenv").config();
const { MongoClient } = require("mongodb");
const { OpenAIEmbeddings } = require("@langchain/openai");

const uri = process.env.MONGO_URI;
const dbName = "Befrienders";
const collectionName = "resources";

(async () => {
  try {
    console.log("[Test] Connecting to MongoDB...");
    const client = new MongoClient(uri);
    await client.connect();
    const collection = client.db(dbName).collection(collectionName);

    // STEP 1: Generate an embedding for a test query
    const query = "caregiver tips";
    console.log(`[Test] Generating embedding for query: "${query}"`);
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-small",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    const [queryVector] = await embeddings.embedDocuments([query]);

    // STEP 2: Run vector search
    console.log("[Test] Running $vectorSearch with query vector...");
    const results = await collection.aggregate([
      {
        $vectorSearch: {
          queryVector: queryVector,
          path: "embedding",
          numCandidates: 100,
          limit: 5,
          index: "resource_index"
        }
      }
    ]).toArray();

    // STEP 3: Print results
    console.log("[Test] Vector search results:");
    console.log(JSON.stringify(results, null, 2));

    await client.close();
  } catch (err) {
    console.error("[Test] Error testing vector search:", err);
  }
})();
