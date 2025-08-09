// Retrieve resources from database, primary is vector embeddings using Langchain, fallback is MongoDB regex
const Resource = require("../models/Resource");

// Vector store functionality for semantic serach
const { getResourceVectorStore } = require("./resourceVectorstore");

//  Get a LangChain retriever for Resource documents, k = number of documents to retrieve
async function getResourceRetriever(k = 5) {
  try {
    // Try vector store, use embeddings to find similar document
    const vectorStore = await getResourceVectorStore();
    return vectorStore.asRetriever(k);
  } catch (err) {
    console.warn("[resourceRetriever] Vector store unavailable. Falling back to keyword search.", err);
    return {
    // Fallback function mimicking retriever.getRelevantDocuments(query)
      getRelevantDocuments: async (query) => {
        const regex = new RegExp(query, "i"); // Case-sensitive regex pattern from user query
        const results = await Resource.find({
          $or: [ // MongoDB keyword matching, matches if any condition is true
            { title: regex },
            { description: regex },
            { category: regex },
            { tags: { $in: [query.toLowerCase()] } },
          ],
        }).limit(k);

        // Convert Mongoose documents to LangChain-like documents
        return results.map((r) => ({
          pageContent: `${r.title}\n${r.url}\n${r.description ?? ""}`,
          metadata: {
            title: r.title,
            url: r.url,
            category: r.category,
            tags: r.tags,
            source: r.source,
          },
        }));
      },
    };
  }
}

module.exports = { getResourceRetriever };
