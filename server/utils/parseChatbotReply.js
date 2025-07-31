const Resource = require("../models/Resource");

// --- Parse AI Response (JSON or fallback text) ---
function parseAIResponse(rawReply) {
  if (!rawReply || typeof rawReply !== "string") return null;

  // Remove markdown code fences like ```json
  rawReply = rawReply.replace(/```json|```/gi, "").trim();

  try {
    // --- Attempt robust JSON extraction ---
    const firstBracket = rawReply.indexOf("[");
    const lastBracket = rawReply.lastIndexOf("]");
    const firstBrace = rawReply.indexOf("{");
    const lastBrace = rawReply.lastIndexOf("}");

    let jsonStr = null;
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      jsonStr = rawReply.slice(firstBracket, lastBracket + 1);
    } else if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = rawReply.slice(firstBrace, lastBrace + 1);
    }

    if (jsonStr) {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => sanitizeParsedResource(item));
      }
      return sanitizeParsedResource(parsed);
    }
  } catch (e) {
    console.warn("[parseAIResponse] JSON parse failed, falling back to text parsing.", e);
  }

  // --- Fallback Text Parsing (single scheme fallback) ---
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
    category: "General",
    tags: inferTags(rawReply),
  });
}

// --- Sanitize resource data ---
function sanitizeParsedResource(parsed) {
  if (!parsed || typeof parsed !== "object") return null;

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
    category = "General";
  }

  return {
    title: (typeof parsed.title === "string" ? parsed.title : "General Advice").trim(),
    description: (parsed.description || "").trim(),
    eligibility: Array.isArray(parsed.eligibility) ? parsed.eligibility.map((e) => e.trim()) : [],
    steps: Array.isArray(parsed.steps) ? parsed.steps.map((s) => s.trim()) : [],
    link: (parsed.link && parsed.link.trim()) || "",
    category,
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
  };
}

// --- Infer tags from text ---
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

// --- Cross-check with DB resources ---
async function crossCheckResource(parsed) {
  if (!parsed) return null;

  let matched = null;

  if (parsed.link && /^https?:\/\//.test(parsed.link)) {
    matched = await Resource.findOne({ url: parsed.link }).lean();
  }

  if (!matched && parsed.title && parsed.title.length > 3) {
    matched = await Resource.findOne({
      title: { $regex: `^${parsed.title}$`, $options: "i" },
    }).lean();
  }

  return matched;
}

// --- Main Parse Chatbot Reply Function ---
async function parseChatbotReply(rawReply) {
  const parsed = parseAIResponse(rawReply);
  if (!parsed) return null;

  if (Array.isArray(parsed)) {
    const results = [];
    for (const scheme of parsed) {
      const checked = await processSingleResource(scheme);
      if (checked) results.push({ metadata: checked });
    }
    return results;
  }

  const checked = await processSingleResource(parsed);
  return { metadata: checked };
}

// --- Process a single resource ---
async function processSingleResource(resource) {
  if (!resource) return null;

  const dbResource = await crossCheckResource(resource);

  if (dbResource) {
    resource.title = dbResource.title;
    resource.link = dbResource.url || resource.link;
    resource.tags = Array.from(new Set([...(resource.tags || []), ...(dbResource.tags || [])]));
    resource.description = resource.description || dbResource.description;
  } else {
    resource.note =
      "Note: This scheme and link are AI-generated and not verified in our resource database. Please verify details from official sources.";
  }

  const allowedCategories = ["Financial", "Medical", "General"];
  if (!allowedCategories.includes(resource.category)) {
    resource.category = "General";
  }

  return resource;
}

module.exports = parseChatbotReply;
