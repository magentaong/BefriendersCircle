const { MongoClient } = require("mongodb");
const { MongoDBAtlasVectorSearch } = require("@langchain/mongodb");
const { OpenAIEmbeddings } = require("@langchain/openai");
const Resource = require("../models/Resource");
require("dotenv").config();

const uri = process.env.MONGO_URI;
const dbName = "Befrienders";
const collectionName = "resources";

// Create or return a LangChain vector store connected to the resource database
async function getResourceVectorStore() {
  if (!uri) throw new Error("MONGO_URI is not defined in .env");

  const client = new MongoClient(uri, { useUnifiedTopology: true });
  await client.connect();

  const collection = client.db(dbName).collection(collectionName);

  return new MongoDBAtlasVectorSearch(new OpenAIEmbeddings(), {
    collection,
    indexName: "resource_index", // Make sure this matches your Atlas index name
    textKey: "combinedText",     // Field to store combined text
    embeddingKey: "embedding",   // Field to store vector embeddings
  });
}

// Generate embeddings for all resources
async function generateResourceEmbeddings() {
  console.log("[Embedding] Starting embedding process...");

  const resources = await Resource.find({});
  console.log(`[Embedding] Found ${resources.length} resources.`);

  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
  });

  for (const res of resources) {
    const combinedText = [
      res.title,
      res.category,
      Array.isArray(res.tags) ? res.tags.join(" ") : "",
      res.description || "",
    ]
      .filter(Boolean)
      .join(" ");

    console.log(`[Embedding] Processing: ${res.title}`);
    console.log(`[Embedding] Combined Text: ${combinedText}`);

    try {
      const [vector] = await embeddings.embedDocuments([combinedText]);

      await Resource.updateOne(
        { _id: res._id },
        { $set: { combinedText, embedding: vector } }
      );

      console.log(`[Embedding] Saved embedding for: ${res.title}`);
    } catch (err) {
      console.error(`[Embedding] Error embedding ${res.title}:`, err);
    }
  }

  console.log("[Embedding] Embedding generation complete!");
}

// Get a LangChain retriever for Resource documents.
async function getResourceRetriever(k = 5) {
  const vectorStore = await getResourceVectorStore();
  return vectorStore.asRetriever(k);
}

module.exports = {
  getResourceVectorStore,
  getResourceRetriever,
  generateResourceEmbeddings,
};
