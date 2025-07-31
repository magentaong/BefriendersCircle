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

// Image mapping for different resource categories
const getImageForResource = (resource) => {
  const title = resource.title.toLowerCase();
  const category = resource.category.toLowerCase();
  const tags = resource.tags?.map(tag => tag.toLowerCase()) || [];

  // Government schemes and financial assistance
  if (category === "finance" || tags.includes("finance") || tags.includes("grant")) {
    if (title.includes("mobility") || title.includes("smf")) {
      return "/Support/Exercise.png";
    }
    if (title.includes("training") || title.includes("ctg")) {
      return "/Support/Training.png";
    }
    if (title.includes("home") || title.includes("hcg")) {
      return "/Support/Family.png";
    }
    if (title.includes("domestic") || title.includes("levy")) {
      return "/Support/Connection.png";
    }
    if (title.includes("health") || title.includes("chas")) {
      return "/Support/Exercise.png";
    }
    if (title.includes("silver") || title.includes("support")) {
      return "/Support/Family.png";
    }
    return "/Support/Exercise.png"; // Default for financial resources
  }

  // Support groups and community
  if (category === "support groups" || category === "community support") {
    return "/Support/Connection.png";
  }

  // Training and courses
  if (category === "courses" || tags.includes("training")) {
    return "/Support/Training.png";
  }

  // Default image
  return "/Support/Family.png";
};

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
    console.error("Error fetching resources:", error);
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
    res.status(400).json({ message: "Failed to create resource." });
  }
});

// Export router for use in server.js
module.exports = router;
