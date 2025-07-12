// Import required modules
import express from "express";
import Resource from "../models/Resource.js";

const router = express.Router();

// GET /api/resources
// Fetch all resources
router.get("/", async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (error) {
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
    res.status(400).json({ message: "Failed to create resource." });
  }
});

// Export router for use in server.js
export default router;
