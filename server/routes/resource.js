// Import required modules
const express = require("express");
const Resource = require("../models/Resource.js");

const router = express.Router();

// Debug middleware to log all requests to resource routes
router.use((req, res, next) => {
  console.log(`Resource route accessed: ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  next();
});

// GET /api/resources
// Fetch all resources with image mapping
router.get("/", async (req, res) => {
  console.log("GET /api/resources - Fetching all resources");
  try {
    const resources = await Resource.find();
    console.log(`Found ${resources.length} resources`);
    
    // Map resources to include images and format for frontend
    const formattedResources = resources.map((resource, index) => ({
      id: resource.rID || `resource_${index + 1}`,
      title: resource.title,
      description: resource.description || `Access ${resource.title} for caregivers and families.`,
      tags: resource.tags || [],
      image: getImageForResource(resource),
      url: resource.url,
      category: resource.category,
      source: resource.source,
      isVerified: resource.isVerified
    }));

    res.json(formattedResources);
  } catch (error) {
    console.error("[Error] Failed to fetch resources:", error);
    res.status(500).json({ message: "Failed to fetch resources." });
  }
});

// GET /api/resources/government-schemes
// Fetch only government schemes and financial assistance
router.get("/government-schemes", async (req, res) => {
  console.log("GET /api/resources/government-schemes - Fetching government schemes");
  
  // First, try to fetch from database
  try {
    const resources = await Resource.find({
      $or: [
        { category: "Finance" },
        { tags: { $in: ["finance", "grant", "SMF", "CTG", "HCG", "levy", "CHAS"] } }
      ]
    });
    
    console.log(`Found ${resources.length} government schemes in database`);
    
    if (resources.length > 0) {
      const formattedResources = resources.map((resource, index) => ({
        id: resource.rID || `scheme_${index + 1}`,
        title: resource.title,
        description: resource.description || `Government assistance program: ${resource.title}`,
        tags: resource.tags || [],
        image: getImageForResource(resource),
        url: resource.url,
        category: resource.category,
        source: resource.source,
        isVerified: resource.isVerified
      }));

      return res.json(formattedResources);
    }
  } catch (error) {
    console.error("Error fetching from database:", error);
  }
  
  // Fallback to static data if database is empty or fails
  console.log("Using fallback data");
  const fallbackData = [
    {
      id: "1",
      title: "Seniors Mobility & Enabling Fund",
      description: "Financial assistance for mobility aids and home healthcare items to help seniors maintain independence and quality of life.",
      tags: ["Age 60+", "Financial", "Mobility", "Healthcare"],
      image: "/Support/Exercise.png",
      url: "https://www.aic.sg/financial-assistance/smef",
      category: "Finance",
      source: "AIC",
      isVerified: true
    },
    {
      id: "2", 
      title: "Caregivers Training Grant",
      description: "Up to $200 per year for caregivers to attend approved training courses to better care for their loved ones.",
      tags: ["Caregivers", "Training", "Financial", "Education"],
      image: "/Support/Training.png",
      url: "https://www.aic.sg/financial-assistance/ctg",
      category: "Finance",
      source: "AIC",
      isVerified: true
    },
    {
      id: "3",
      title: "Home Caregiving Grant",
      description: "Monthly cash grant of $200 for families caring for seniors with permanent moderate disability at home.",
      tags: ["Caregivers", "Financial", "Home Care", "Monthly"],
      image: "/Support/Family.png",
      url: "https://www.aic.sg/financial-assistance/hcg",
      category: "Finance",
      source: "AIC",
      isVerified: true
    }
  ];
  
  res.json(fallbackData);
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
