const Resource = require("../models/Resource");

async function getResources() {
  return await Resource.find();
}

async function createResource(resourceData) {
  const newResource = new Resource(resourceData);
  await newResource.save();
  return newResource;
}

async function getCategories() {
  return await Resource.distinct("category");
}

async function reloadResources() {
  const resources = await Resource.find().sort({ createdAt: -1 });
  const categories = Array.from(new Set(resources.map((r) => r.category || "General")));
  return { resources, categories };
}

module.exports = { getResources, createResource, getCategories, reloadResources}
