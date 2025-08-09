const Resource = require("../models/Resource");

// Parse AI response and return null if input is invalid
function parseAIResponse(rawReply) {
  if (!rawReply || typeof rawReply !== "string") return null;

  // Remove markdown code fences like ```json
  rawReply = rawReply.replace(/```json|```/gi, "").trim();

  try {
    // --- Attempt robust JSON extraction ---
    // Find positions of JSON delimiters
    const firstBracket = rawReply.indexOf("[");
    const lastBracket = rawReply.lastIndexOf("]");
    const firstBrace = rawReply.indexOf("{");
    const lastBrace = rawReply.lastIndexOf("}");

    // Extract JSON array, may have issues extracting properly/cleanly
    let jsonStr = null;
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      jsonStr = rawReply.slice(firstBracket, lastBracket + 1);
    } else if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = rawReply.slice(firstBrace, lastBrace + 1);
    }

    // If JSON-like content, parse it and handle array of resources
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
  // Split response into lines and filter out empty ones
  const lines = rawReply.split("\n").map((l) => l.trim()).filter(Boolean);
  // First line as title (not usually)
  const title = lines[0] || "General Advice";

  // Find sections in text looking for keywords
  const eligibilityIndex = lines.findIndex((l) => l.toLowerCase().startsWith("eligibility"));
  const stepsIndex = lines.findIndex((l) => l.toLowerCase().startsWith("steps"));

  // Initialize arrays for data
  const eligibility = [];
  const steps = [];

  // Process Eligibility if exist, in a bullet point format
  if (eligibilityIndex !== -1) {
    for (let i = eligibilityIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (stepsIndex !== -1 && i >= stepsIndex) break;
      if (line.startsWith("•") || line.startsWith("-")) {
        eligibility.push(line.replace(/^[-•]\s*/, "").trim());
      }
    }
  }

  // Process steps if exists in a bullet point format
  if (stepsIndex !== -1) {
    for (let i = stepsIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith("•") || line.startsWith("-")) {
        steps.push(line.replace(/^[-•]\s*/, "").trim());
      }
    }
  }

  // Extract link (may not provide a valid link) using regex
  const linkMatch = rawReply.match(/https?:\/\/[^\s)]+/);
  const link = linkMatch ? linkMatch[0] : "";

  // return resource object
  return sanitizeParsedResource({
    title,
    description: lines.slice(1).join(" ") || rawReply,
    eligibility,
    steps,
    link,
    category: inferCategoryFromText(rawReply), // automatically categorize after matching with database
    tags: inferTags(rawReply), // extract tags
  });
}

// Clean resource data and return null if invalid input
function sanitizeParsedResource(parsed) {
  if (!parsed || typeof parsed !== "object") return null;

  // Obtain original category and normalize for comparison
  let origCategory = parsed.category || "";
  let normalizedCategory = origCategory.trim().toLowerCase();

  let category = null;

  // May not seem efficient, but the AI output tends to be predictable and generalized
  // Therefore, keyword matching is used for category classfication logic 
  if (["financial", "finance", "fund", "grant"].some(k => normalizedCategory.includes(k)))  {
    category = "Financial";
  } else if (
    ["medical", "health", "hospital", "clinic"].some(k => normalizedCategory.includes(k))
  ) {
    category = "Medical";
  } else if (
    ["general", "misc", ""].some(k => normalizedCategory === k)
  ) {
    category = "General";
  } else if (origCategory) {
    category = origCategory; // Use original category 
  } else {
    category = "General";
  }

  return {
    // Return cleaned and normalized resource object
    title: (typeof parsed.title === "string" ? parsed.title : "General Advice").trim(),
    // Ensure arrays are trimmed as well
    description: (parsed.description || "").trim(),
    eligibility: Array.isArray(parsed.eligibility) ? parsed.eligibility.map((e) => e.trim()) : [],
    steps: Array.isArray(parsed.steps) ? parsed.steps.map((s) => s.trim()) : [],
    link: (parsed.link && parsed.link.trim()) || "",
    category,
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
  };
}

// Ensure that tags are extracted correctly by checking for specific keywords and tags,
// Future improvement would be to group tags(?) as they tend to be overlap
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

// Determine category (important) as some categories such as general tend to be produced more frequently than another
// Resources also tend to overlap categories, e.g. financial and medical tend to go under general if they are vague or mixed
function inferCategoryFromText(text) {
  const lower = text.toLowerCase();
  if (lower.includes("finance") || lower.includes("fund") || lower.includes("grant") || lower.includes("subsidy")) {
    return "Financial";
  }
  if (lower.includes("medical") || lower.includes("health") || lower.includes("hospital") || lower.includes("clinic")) {
    return "Medical";
  }
  return "General";
}

// --- Cross-check with DB resources ---
// To verify against existing database
async function crossCheckResource(parsed) {
  if (!parsed) return null;

  let matched = null;

  // Match by URL/link first and foremost
  if (parsed.link && /^https?:\/\//.test(parsed.link)) {
    matched = await Resource.findOne({ url: parsed.link }).lean();
  }

  // Then match by title 
  if (!matched && parsed.title && parsed.title.length > 3) {
    matched = await Resource.findOne({
      title: { $regex: `^${parsed.title}$`, $options: "i" },
    }).lean();
  }

  return matched;
}

// --- Main Parse Chatbot Reply Function ---
// Parse AI response into structured data and handle multiple resources
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

  // Handle single resource
  const checked = await processSingleResource(parsed);
  return { metadata: checked };
}

// Check for odd titles, or if it is a description
function isLikelyTitle(str) {
  if (!str) return false;
  if (str.length > 80) return false;
  if (/[.!?]$/.test(str.trim())) return false;
  // Filter out conversational responses
  if (/wonderful|seeking|financial support|checking|ensure|deserve|help/i.test(str)) return false;
  return true;
}

// Process resources and check with database, replace title with one in database to prevent duplicates
async function processSingleResource(resource) {
  if (!resource) return null;

  // Check first if resource exists in database
  const dbResource = await crossCheckResource(resource);

  if (dbResource) {
    // If it is found, use verified data
    // Use database title if its a proper title
    if (isLikelyTitle(dbResource.title)) {
      resource.title = dbResource.title;
    }
    // Use database URL as a priority, as AI tends to generate invalid links
    resource.link = dbResource.url || resource.link;
    // Merge tags from both AI and database but remove duplicates
    resource.tags = Array.from(new Set([...(resource.tags || []), ...(dbResource.tags || [])]));
    resource.description = resource.description || dbResource.description;
  } else {
    resource.note = // No Database Match, add disclaimer for AI-generated content
      "Note: This scheme and link are AI-generated and not verified in our resource database. Please verify details from official sources.";
  }

  // Further validation of category
  const allowedCategories = ["Financial", "Medical", "General"];
  if (!allowedCategories.includes(resource.category)) {
    resource.category = "General";
  }

  return resource;
}

module.exports = parseChatbotReply;
