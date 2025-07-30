// Import required modules
const express = require("express");
const Resource = require("../models/Resource.js");

const router = express.Router();

// GET /api/resources
// Fetch all resources
router.get("/", async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (error) {
    console.error("[Error] Failed to fetch resources:", error);
    res.status(500).json({ message: "Failed to fetch resources." });
  }
});

// POST /api/resources
// Create a new resource
router.post("/", async (req, res) => {
  try {
    const newResource = new Resource(req.body);
    await newResource.save();
    res.status(201).json(newResource);
  } catch (error) {
    console.error("[Error] Failed to create resource:", error);
    res.status(400).json({ message: "Failed to create resource." });
  }
});

// GET /api/resources/categories
// Fetch distinct categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Resource.distinct("category");
    res.json(categories);
  } catch (error) {
    console.error("[Error] Failed to fetch categories:", error);
    res.status(500).json({ message: "Failed to fetch categories." });
  }
});

// GET /api/resources/reload
// Fetch all resources and categories in one response
router.get("/reload", async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 }); // Latest first
    const categories = Array.from(
      new Set(resources.map((r) => r.category || "General"))
    );

    res.json({ resources, categories });
  } catch (error) {
    console.error("[Error] Failed to reload resources:", error);
    res.status(500).json({ message: "Failed to reload resources." });
  }
});

module.exports = router;
