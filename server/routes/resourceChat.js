const express = require("express");
const ResourceChat = require("../models/ResourceChat");

const router = express.Router();

// GET all chatbot resources
router.get("/", async (req, res) => {
  try {
    const resources = await ResourceChat.find().sort({ createdAt: -1 });
    const categories = Array.from(new Set(resources.map((r) => r.category || "General")));
    res.json({ resources, categories });
  } catch (error) {
    console.error("[Error] Failed to fetch chatbot resources:", error);
    res.status(500).json({ message: "Failed to fetch chatbot resources." });
  }
});

// POST a new chatbot resource
router.post("/", async (req, res) => {
  try {
    const { title, description, eligibility, steps, link, category, tags, note} = req.body;

    const newResource = new ResourceChat({
      title,
      description,
      eligibility: eligibility || [],
      steps: steps || [],
      link: link || "",
      category: category || "General",
      tags: tags || [],
      note: note || ""
    });

    await newResource.save();
    res.status(201).json(newResource);
  } catch (error) {
    console.error("[Error] Failed to create chatbot resource:", error);
    res.status(400).json({ message: "Failed to create chatbot resource." });
  }
});

// DELETE all chatbot resources 
router.delete("/", async (req, res) => {
  try {
    await ResourceChat.deleteMany({});
    res.json({ message: "All chatbot resources deleted." });
  } catch (error) {
    console.error("[Error] Failed to delete chatbot resources:", error);
    res.status(500).json({ message: "Failed to delete chatbot resources." });
  }
});

module.exports = router;
