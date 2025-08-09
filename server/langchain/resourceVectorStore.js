// Converts resources to embeddings for AI-powered search, integrated with RAG LangChain pipeline

const { MongoClient } = require("mongodb");
// MongoDB Atlas Vector Search integration
const { MongoDBAtlasVectorSearch } = require("@langchain/mongodb");
// Embeddings model from OpenAI to convert text to vectors
const { OpenAIEmbeddings } = require("@langchain/openai");
// Resources for database ops
const Resource = require("../models/Resource");
require("dotenv").config();

// Database config
const uri = process.env.MONGO_URI;
const dbName = "Befrienders";
const collectionName = "resources";

// Create or return a LangChain vector store connected to the resource database
async function getResourceVectorStore() {
  if (!uri) throw new Error("MONGO_URI is not defined in .env");

  // Direct connection to mongodb
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  await client.connect();

  // Reference to collection where resources are stored
  const collection = client.db(dbName).collection(collectionName);

  // Return LangChain MongoDB Atlast Vector Search instance
  return new MongoDBAtlasVectorSearch(new OpenAIEmbeddings(), {
    collection, // MongoDB collection reference
    indexName: "resource_index", // Atlas Search index name
    textKey: "combinedText",     // Field to store combined text
    embeddingKey: "embedding",   // Field to store vector embeddings
  });
}

// Generate embeddings for all resources
async function generateResourceEmbeddings() {
  console.log("[Embedding] Starting embedding process...");

  // Fetch all resources from database
  const resources = await Resource.find({});
  console.log(`[Embedding] Found ${resources.length} resources.`);

  // OpenAI embeddings with specific model
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
  });

  // Process each resource individually to generate embeddings
  for (const res of resources) {
    const combinedText = [ // Combine multiple resource fields into searchable text
      res.title,
      res.category,
      Array.isArray(res.tags) ? res.tags.join(" ") : "",
      res.description || "",
    ]
      .filter(Boolean)
      .join(" ");

    console.log(`[Embedding] Processing: ${res.title}`);
    console.log(`[Embedding] Combined Text: ${combinedText}`);

    try { // Generate vector embeddings for combined text
      const [vector] = await embeddings.embedDocuments([combinedText]);

      // Update resource document in MongoDB with combined text and embedding
      await Resource.updateOne(
        { _id: res._id },
        { $set: { combinedText, embedding: vector } } // Store array of numbers
      );

      console.log(`[Embedding] Saved embedding for: ${res.title}`);
    } catch (err) {
      console.error(`[Embedding] Error embedding ${res.title}:`, err);
    }
  }

  console.log("[Embedding] Embedding generation complete!");
}

// Get a LangChain retriever for Resource documents and get vector store instance
async function getResourceRetriever(k = 5) {
  const vectorStore = await getResourceVectorStore();
  return vectorStore.asRetriever(k);
}

module.exports = {
  getResourceVectorStore,
  getResourceRetriever,
  generateResourceEmbeddings,
};
