const ResourceChat = require("../models/ResourceChat");

async function getChatbotResources() {
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
  return { resources, categories };
}

async function createChatbotResource(resourceData) {
  const { title, description, eligibility, steps, link, category, tags, note } = resourceData;

  if (
    !title ||
    title.trim().length === 0 ||
    (!description && (!eligibility || eligibility.length === 0) && (!steps || steps.length === 0))
  ) {
    const error = new Error("Invalid resource data.");
    error.status = 400;
    throw error;
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
  return newResource;
}

async function deleteAllChatbotResources() {
  await ResourceChat.deleteMany({});
  return { message: "All chatbot resources deleted." };
}

module.exports = {getChatbotResources, createChatbotResource, deleteAllChatbotResources};
