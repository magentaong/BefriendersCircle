const Resource = require("../models/Resource");
const { getResourceVectorStore } = require("./resourceVectorstore");

//  Get a LangChain retriever for Resource documents.
async function getResourceRetriever(k = 5) {
  try {
    // Try vector store
    const vectorStore = await getResourceVectorStore();
    return vectorStore.asRetriever(k);
  } catch (err) {
    console.warn("[resourceRetriever] Vector store unavailable. Falling back to keyword search.", err);
    return {
    // Fallback function mimicking retriever.getRelevantDocuments(query)
      getRelevantDocuments: async (query) => {
        const regex = new RegExp(query, "i");
        const results = await Resource.find({
          $or: [
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
