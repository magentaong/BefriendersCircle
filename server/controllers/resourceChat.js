// Chatbot resources
const ResourceChat = require("../models/ResourceChat");

// Retrieve chatbot resources
async function getChatbotResources() {
  let resources = await ResourceChat.find().sort({ createdAt: -1 });

  // Filter out resources with missing or invalid data
  resources = resources.filter((r) => {
    const hasTitle =
      r.title &&
      r.title.trim().length > 0 &&
      !r.title.toLowerCase().includes("it's wonderful") &&
      !r.title.toLowerCase().includes("you're"); // Check if title is valid or generic positive

      // Check if resource has in at least one field
    const hasContent =
      (r.description && r.description.trim().length > 0) ||
      (Array.isArray(r.eligibility) && r.eligibility.length > 0) ||
      (Array.isArray(r.steps) && r.steps.length > 0);

    return hasTitle && hasContent;
  });

  // Extract unique categories from filtered resources
  const categories = Array.from(new Set(resources.map((r) => r.category || "General")));
  return { resources, categories };
}

// Create a new chatbot resource with validation
async function createChatbotResource(resourceData) {
  // Destructure possible fields from input data
  const { title, description, eligibility, steps, link, category, tags, note } = resourceData;

  if ( // validation before creating resource
    !title || // Required
    title.trim().length === 0 || // Cannot be empty/whitespace
    (!description && (!eligibility || eligibility.length === 0) && (!steps || steps.length === 0))
  ) {
    // API error handling
    const error = new Error("Invalid resource data.");
    error.status = 400; // Bad Request status code
    throw error;
  }
  // New doc with validated data
  const newResource = new ResourceChat({
    title: title.trim(), // Removing leading whitespace
    description: (description || "").trim(), // Default to empty string if undefined
    eligibility: eligibility || [], 
    steps: steps || [],
    link: link || "",
    category: category || "General",
    tags: tags || [],
    note: note || ""
  });

  await newResource.save();
  return newResource;
}

// DELETES EVERYTHING
// Add deletion logging
async function deleteAllChatbotResources() {
  await ResourceChat.deleteMany({});
  console.log("OOPSIE DOOPSIE YOU DELETED ALL THE RESOURCES")
  return { message: "All chatbot resources deleted." };
}

module.exports = {getChatbotResources, createChatbotResource, deleteAllChatbotResources};
