const Resource = require("../models/Resource");

// Retrieve verified resources from database
async function getResources() {
  return await Resource.find();
}

// Create and save a new resource
async function createResource(resourceData) {
  const newResource = new Resource(resourceData);
  await newResource.save();
  return newResource;
}

// Get all new unique category values from existing resources
async function getCategories() {
  return await Resource.distinct("category");
}

// Reload resources and categories with fresh data
async function reloadResources() {
  // Fetch resources with sorting aplplied, createdAt field in descending order -1: newest, 1: oldest
  const resources = await Resource.find().sort({ createdAt: -1 }); // Transforms each resource into category value
  const categories = Array.from(new Set(resources.map((r) => r.category || "General"))); 
  return { resources, categories };
}

module.exports = { getResources, createResource, getCategories, reloadResources}
