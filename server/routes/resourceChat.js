const express = require("express");
const ResourceChat = require("../models/ResourceChat");

const router = express.Router();

// GET all chatbot resources
router.get("/", async (req, res) => {
  try {
    let resources = await ResourceChat.find().sort({ createdAt: -1 });

    // Filter out resources with missing or invalid data
    resources = resources.filter((r) => {
      const hasTitle =
        r.title &&
        r.title.trim().length > 0 &&
        !r.title.toLowerCase().includes("it's wonderful") &&
        !r.title.toLowerCase().includes("you're");

      const hasContent =
        (r.description && r.description.trim().length > 0) ||
        (Array.isArray(r.eligibility) && r.eligibility.length > 0) ||
        (Array.isArray(r.steps) && r.steps.length > 0);

      return hasTitle && hasContent;
    });


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
    const { title, description, eligibility, steps, link, category, tags, note } = req.body;

    // Validate resource
    if (
      !title || 
      title.trim().length === 0 ||
      (!description && (!eligibility || eligibility.length === 0) && (!steps || steps.length === 0))
    ) {
      return res.status(400).json({ message: "Invalid resource data." });
    }

    const newResource = new ResourceChat({
      title: title.trim(),
      description: (description || "").trim(),
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
