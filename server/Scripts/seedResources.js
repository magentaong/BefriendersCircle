require("dotenv").config();
const mongoose = require("mongoose");
const Resource = require("../models/Resource");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB...");
  seedData();
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

const resources = [
  // === RESOURCES ===
  {
    title: "Dementia - Agency for Integrated Care",
    category: "Resources",
    url: "https://www.aic.sg/caregiving/dementia-symptoms-support-resources/",
    tags: ["dementia", "support", "caregiving"],
    source: "AIC",
    isVerified: true
  },
  {
    title: "DementiaHub SG - Programmes and Services",
    category: "Resources",
    url: "https://www.dementiahub.sg/living-well-with-dementia/programmes-and-services/",
    tags: ["dementia", "support", "training"],
    source: "DementiaHub",
    isVerified: true
  },
  {
    title: "Dementia Friend Home 360 (VR)",
    category: "Resources",
    url: "https://cloudexpo.hiverlab.com/DFHome/",
    tags: ["dementia", "VR", "training"],
    source: "Hiverlab",
    isVerified: true
  },
  {
    title: "Dementia Friendly Environment Resources",
    category: "Resources",
    url: "https://www.dementiahub.sg/resource-category/resources/dementia-friendly-environment-resources/",
    tags: ["dementia", "environment"],
    source: "DementiaHub",
    isVerified: true
  },
  {
    title: "Living with Dementia - After Diagnosis",
    category: "Resources",
    url: "https://www.dementiahub.sg/living-well-with-dementia/living-well-with-dementia/",
    tags: ["dementia", "diagnosis", "care"],
    source: "DementiaHub",
    isVerified: true
  },
  {
    title: "Living with Dementia - Resource Kit",
    category: "Resources",
    url: "https://www.dementiahub.sg/living-with-dementia-a-resource-kit-for-caregivers/",
    tags: ["dementia", "caregiver", "resource kit"],
    source: "DementiaHub",
    isVerified: true
  },
  {
    title: "Information and Resources on Caregiving",
    category: "Resources",
    url: "https://www.aic.sg/community/information-and-resources-on-caregiving/",
    tags: ["caregiving", "resources"],
    source: "AIC",
    isVerified: true
  },

  // === COURSES ===
  {
    title: "Understanding Dementia (Course)",
    category: "Courses",
    url: "https://ccmhdcomms.github.io/UD-2023/#/",
    tags: ["dementia", "training"],
    source: "CCMHD",
    isVerified: true
  },
  {
    title: "Dementia Training for Family Caregivers",
    category: "Courses",
    url: "https://www.dementiahub.sg/living-well-with-dementia/caregiver-training-and-courses/",
    tags: ["dementia", "training", "family"],
    source: "DementiaHub",
    isVerified: true
  },
  {
    title: "Dementia Awareness Workshop",
    category: "Courses",
    url: "https://dementia.org.sg/academy/awareness/",
    tags: ["dementia", "awareness"],
    source: "Dementia Singapore",
    isVerified: true
  },
  {
    title: "Facilitate Meaningful Interaction",
    category: "Courses",
    url: "https://dementia.org.sg/academy/interaction/",
    tags: ["dementia", "interaction"],
    source: "Dementia Singapore",
    isVerified: true
  },
  {
    title: "Reminiscence Arts for Dementia",
    category: "Courses",
    url: "https://dementia.org.sg/academy/rad/",
    tags: ["arts", "dementia"],
    source: "Dementia Singapore",
    isVerified: true
  },
  {
    title: "EDIE: Educational Dementia Immersive Experience",
    category: "Courses",
    url: "https://dementia.org.sg/academy/edie/",
    tags: ["dementia", "VR", "education"],
    source: "Dementia Singapore",
    isVerified: true
  },
  {
    title: "FDW Core Module – Essentials of Dementia Care",
    category: "Courses",
    url: "https://dementia.org.sg/academy/fdw/#core",
    tags: ["FDW", "training", "dementia"],
    source: "Dementia Singapore",
    isVerified: true
  },
  {
    title: "FDW Elective Module – Meaningful Activities",
    category: "Courses",
    url: "https://dementia.org.sg/academy/fdw/#elective",
    tags: ["FDW", "activities"],
    source: "Dementia Singapore",
    isVerified: true
  },

  // === FINANCIAL ASSISTANCE ===
  {
    title: "MOH – Keeping Healthcare Affordable",
    category: "Finance",
    url: "https://www.moh.gov.sg/managing-expenses/keeping-healthcare-affordable",
    tags: ["healthcare", "moh", "expenses"],
    source: "MOH",
    isVerified: true
  },
  {
    title: "Senior’s Mobility and Enabling Fund",
    category: "Finance",
    url: "https://www.moh.gov.sg/managing-expenses/keeping-healthcare-affordable/help-for-caregiver#7fa1c3a8a3b228f24c9304db7d9bbdfe",
    tags: ["mobility", "finance", "SMF"],
    source: "MOH",
    isVerified: true
  },
  {
    title: "Caregivers Training Grant (CTG)",
    category: "Finance",
    url: "https://www.moh.gov.sg/managing-expenses/keeping-healthcare-affordable/help-for-caregiver#6580ced41ac8d4474d039786e30e8da6",
    tags: ["CTG", "finance", "training"],
    source: "MOH",
    isVerified: true
  },
  {
    title: "Home Caregiving Grant (HCG)",
    category: "Finance",
    url: "https://www.moh.gov.sg/managing-expenses/keeping-healthcare-affordable",
    tags: ["HCG", "support", "home"],
    source: "MOH",
    isVerified: true
  },
  {
    title: "MDW Levy Concession for Seniors & PWDs",
    category: "Finance",
    url: "https://www.moh.gov.sg/managing-expenses/keeping-healthcare-affordable",
    tags: ["MDW", "levy", "concession"],
    source: "MOH",
    isVerified: true
  },
  {
    title: "NTUC Care Fund for Single Caregivers",
    category: "Finance",
    url: "https://www.ntuc.org.sg/uportal/news/Single%20Caregivers/",
    tags: ["NTUC", "fund", "single caregiver"],
    source: "NTUC",
    isVerified: true
  },

  // === SUPPORT GROUPS ===
  {
    title: "CREST Community Outreach Teams",
    category: "Support Groups",
    url: "https://supportgowhere.life.gov.sg/services/SVC-COTC/community-outreach-teams-crest#sp-header",
    tags: ["crest", "support"],
    source: "SupportGoWhere",
    isVerified: true
  },
  {
    title: "#DementiaFriendlySG Movement",
    category: "Support Groups",
    url: "https://www.dementiahub.sg/dfsg-movement",
    tags: ["dementia", "movement"],
    source: "DementiaHub",
    isVerified: true
  },
  {
    title: "Caregiver Support Network (CSN)",
    category: "Support Groups",
    url: "https://www.aic.sg/caregiving/tips-from-other-caregivers/",
    tags: ["support", "caregivers"],
    source: "AIC",
    isVerified: true
  },
  {
    title: "Become a Caregiver Mentor",
    category: "Support Groups",
    url: "https://www.enablingguide.sg/caring-for-caregivers/be-a-caregiver-mentor",
    tags: ["mentor", "caregivers"],
    source: "Enabling Guide",
    isVerified: true
  },
  {
    title: "Caregiver Facebook Group",
    category: "Support Groups",
    url: "https://www.facebook.com/groups/CaregiversSupportGroupSG/",
    tags: ["facebook", "community"],
    source: "Facebook",
    isVerified: true
  },
  {
    title: "Enabling Guide Informal Support Groups",
    category: "Support Groups",
    url: "https://www.enablingguide.sg/caring-for-caregivers/informal-support-groups",
    tags: ["support", "informal"],
    source: "Enabling Guide",
    isVerified: true
  }
];

async function seedData() {
  try {
    await Resource.deleteMany({});
    await Resource.insertMany(resources);
    console.log("Resources inserted successfully.");
    mongoose.disconnect();
  } catch (err) {
    console.error("Error seeding data:", err);
    mongoose.disconnect();
  }
}
