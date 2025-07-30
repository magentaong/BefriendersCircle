const Resource = require("../models/Resource");

// Parse AI Response (JSON or fallback text)
function parseAIResponse(rawReply) {
  if (!rawReply || typeof rawReply !== "string") return null;

  rawReply = rawReply.replace(/```json|```/gi, "").trim();

  // Attempt JSON parsing
  try {
    const jsonStart = rawReply.indexOf("{");
    const jsonEnd = rawReply.lastIndexOf("}") + 1;
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonStr = rawReply.slice(jsonStart, jsonEnd);
      const parsed = JSON.parse(jsonStr);

      return sanitizeParsedResource(parsed);
    }
  } catch (e) {
    console.warn("[parseAIResponse] Failed JSON parse, falling back to text parsing.", e);
  }

  // Fallback Text Parsing 
  const lines = rawReply.split("\n").map((l) => l.trim()).filter(Boolean);
  const title = lines[0] || "General Advice";

  const eligibilityIndex = lines.findIndex((l) => l.toLowerCase().startsWith("eligibility"));
  const stepsIndex = lines.findIndex((l) => l.toLowerCase().startsWith("steps"));

  const eligibility = [];
  const steps = [];

  if (eligibilityIndex !== -1) {
    for (let i = eligibilityIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (stepsIndex !== -1 && i >= stepsIndex) break;
      if (line.startsWith("•") || line.startsWith("-")) {
        eligibility.push(line.replace(/^[-•]\s*/, "").trim());
      }
    }
  }

  if (stepsIndex !== -1) {
    for (let i = stepsIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith("•") || line.startsWith("-")) {
        steps.push(line.replace(/^[-•]\s*/, "").trim());
      }
    }
  }

  const linkMatch = rawReply.match(/https?:\/\/[^\s)]+/);
  const link = linkMatch ? linkMatch[0] : "";

  return sanitizeParsedResource({
    title,
    description: lines.slice(1).join(" ") || rawReply,
    eligibility,
    steps,
    link,
    category: "General", // default
    tags: inferTags(rawReply),
  });
}

// Sanitize resource data
function sanitizeParsedResource(parsed) {
  let category = (parsed.category || "").toLowerCase();

  if (category.includes("finance") || category.includes("fund") || category.includes("grant")) {
    category = "Financial";
  } else if (
    category.includes("medical") ||
    category.includes("health") ||
    category.includes("hospital") ||
    category.includes("clinic")
  ) {
    category = "Medical";
  } else {
    category = "General"; // Force fallback
  }

  return {
    title: (parsed.title || "General Advice").trim(),
    description: (parsed.description || "").trim(),
    eligibility: Array.isArray(parsed.eligibility) ? parsed.eligibility.map((e) => e.trim()) : [],
    steps: Array.isArray(parsed.steps) ? parsed.steps.map((s) => s.trim()) : [],
    link: (parsed.link && parsed.link.trim()) || "",
    category,
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
  };
}

// Infer tags from text 
function inferTags(text) {
  const tags = [];
  const lower = text.toLowerCase();
  if (lower.includes("dementia")) tags.push("dementia");
  if (lower.includes("caregiver")) tags.push("caregiver");
  if (lower.includes("financial") || lower.includes("grant") || lower.includes("subsidy"))
    tags.push("finance");
  if (lower.includes("mobility")) tags.push("mobility");
  if (lower.includes("healthcare")) tags.push("healthcare");
  if (lower.includes("training")) tags.push("training");
  if (lower.includes("support")) tags.push("support");
  return tags;
}

// Cross-check with DB resources 
async function crossCheckResource(parsed) {
  if (!parsed) return null;

  let matched = null;

  // Match by exact link
  if (parsed.link && /^https?:\/\//.test(parsed.link)) {
    matched = await Resource.findOne({ url: parsed.link }).lean();
  }

  // Match by exact title
  if (!matched && parsed.title && parsed.title.length > 3) {
    matched = await Resource.findOne({
      title: { $regex: `^${parsed.title}$`, $options: "i" },
    }).lean();
  }

  return matched;
}

// Main Parse Chatbot Reply Function 
async function parseChatbotReply(rawReply) {
  const parsed = parseAIResponse(rawReply);
  if (!parsed) return null;

  const dbResource = await crossCheckResource(parsed);

  if (dbResource) {
    // Overwrite with verified DB resource details
    parsed.title = dbResource.title || parsed.title;
    parsed.link = dbResource.url || parsed.link;
    parsed.tags = Array.from(new Set([...(parsed.tags || []), ...(dbResource.tags || [])]));
    parsed.description = parsed.description || dbResource.description || dbResource.title;
  } else {
    // Add note for AI-generated content
    parsed.note =
      "Note: This scheme and link are AI-generated and not verified in our resource database. Please verify details from official sources.";
  }

  // Ensure only allowed categories
  const allowedCategories = ["Financial", "Medical", "General"];
  if (!allowedCategories.includes(parsed.category)) {
    parsed.category = "General";
  }

  console.log("[Parsed AI Resource]:", parsed);
  return { metadata: parsed };
}

module.exports = parseChatbotReply;
