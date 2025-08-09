const express = require("express");
// Import OpenAI chat controller with RAG functionality
const { createChatbotResource, getChatbotResources, deleteAllChatbotResources } = require("../controllers/resourceChat");
const router = express.Router();

// GET all chatbot resources
router.get("/", async (req, res) => {
  try {
    // Obtain filtered resources and categories
    const data = await getChatbotResources();
    res.json(data);
  } catch (error) {
    console.error("[Error] Failed to fetch chatbot resources:", error);
    res.status(500).json({ message: "Failed to fetch chatbot resources." });
  }
});

// POST a new chatbot resource
router.post("/", async (req, res) => {
  try {
    const newResource = await createChatbotResource(req.body);
    res.status(201).json(newResource);
  } catch (error) {
    console.error("[Error] Failed to create chatbot resource:", error);
    res.status(400).json({ message: "Failed to create chatbot resource." });
  }
});


// DELETE all chatbot resources 
router.delete("/", async (req, res) => {
  try {
    const result = await deleteAllChatbotResources(); // WIPES ALL RESOURCES
    res.json(result);
  } catch (error) {
    console.error("[Error] Failed to delete chatbot resources:", error);
    res.status(500).json({ message: "Failed to delete chatbot resources." });
  }
});

module.exports = router;
