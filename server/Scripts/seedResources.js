require("dotenv").config();
const mongoose = require("mongoose");
const Resource = require("../models/Resource");
const { nanoid } = require("nanoid");


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
    title: "Living with Dementia - Resource Kit for Caregivers",
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
    title: "Facilitate Meaningful Interaction (Dementia)",
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
    title: "Foreign Domestic Workers(FWD) Core Module - Essentials of Dementia Care",
    category: "Courses",
    url: "https://dementia.org.sg/academy/fdw/#core",
    tags: ["FDW", "training", "dementia"],
    source: "Dementia Singapore",
    isVerified: true
  },
  {
    title: "FDW Elective Module - Meaningful Activities",
    category: "Courses",
    url: "https://dementia.org.sg/academy/fdw/#elective",
    tags: ["FDW", "activities"],
    source: "Dementia Singapore",
    isVerified: true
  },

  // === FINANCIAL ASSISTANCE ===
  {
    title: "MOH - Keeping Healthcare Affordable",
    category: "Finance",
    url: "https://www.moh.gov.sg/managing-expenses/keeping-healthcare-affordable",
    tags: ["healthcare", "moh", "expenses"],
    source: "MOH",
    isVerified: true
  },
  {
    title: "Senior's Mobility and Enabling Fund(SMF)",
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
    title: "Migrant Domestic Worker(MDW) Levy Concession for Seniors & PWDs",
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
    title: "Caregivers Connect",
    category: "Support Groups",
    url: "https://www.facebook.com/thecaregiversconnect/",
    tags: ["community", "caregivers", "support"],
    source: "Facebook",
    isVerified: true
  },

  {
    title: "Caregivers Support Group",
    category: "Support Groups",
    url: "https://www.facebook.com/thecaregiversconnect/",
    tags: ["caregivers", "support"],
    source: "Facebook Group",
    isVerified: true
  },
  
    {
    title: "SG Caregivers",
    category: "Support Groups",
    url: "https://t.me/SGCaregivers",
    tags: ["caregivers", "community"],
    source: "Telegram Channel",
    isVerified: true
  },

    {
    title: "SG Caregivers Community",
    category: "Support Groups",
    url: "t.me/SGCaregiversCommunity",
    tags: ["caregivers", "support", "resources"],
    source: "Telegram Channel",
    isVerified: true
  },

    {
    title: "Caregiver and the Elderly",
    category: "Support Groups",
    url: "https://www.facebook.com/thecaregiversconnect/",
    tags: ["elderly", "support", "resources"],
    source: "Facebook Group",
    isVerified: true
  },

    {
    title: "Chronic Obstructive Pulmonary Disease Association (Singapore)",
    category: "Medical Condition Support",
    url: "https://www.facebook.com/COPDAS/",
    tags: ["COPD", "lung health", "resources"],
    source: "Facebook",
    isVerified: true
  },

    {
    title: "Diabetes Singapore",
    category: "Medical Condition Support",
    url: "https://www.facebook.com/thediabetessingapore#",
    tags: ["diabetes", "resources"],
    source: "Facebook",
    isVerified: true
  },

    {
    title: "Life after Stroke in Singapore",
    category: "Medical Condition Support",
    url: "https://www.facebook.com/groups/50074405975",
    tags: ["support", "stroke", "survivor support"],
    source: "Facebook Group",
    isVerified: true
  },

    {
    title: "PH Singapore (Pulmonary Hypertension)",
    category: "Medical Condition Support",
    url: "https://www.facebook.com/PAHsg/",
    tags: ["PAH", "community"],
    source: "Facebook",
    isVerified: true
  },

    {
    title: "Singapore Liver Cancer Support Group",
    category: "Medical Condition Support",
    url: "https://www.facebook.com/SingaporeLiverCancer/",
    tags: ["liver cancer", "support"],
    source: "Facebook",
    isVerified: true
  },

    {
    title: "CWA Caregivers Support Group",
    category: "Community Support",
    url: "https://www.cwa.org.sg/caregiver-support-group/",
    tags: ["caregivers", "community", "support"],
    source: "Caregiving Welfare Association",
    isVerified: true
  },
  
    {
    title: "CAL Caregiver Support",
    category: "Community Support",
    url: "https://www.cal.org.sg/caregiver-support",
    tags: ["training", "mental health", "support"],
    source: "Caregivers Alliance Limited",
    isVerified: true
  },

    {
    title: "Caregiver Support Network Community Outreach Team (CREST-CSN)",
    category: "Community Support",
    url: "https://www.clubheal.sg/crest-caregivers",
    tags: ["caregivers", "support", "mental health"],
    source: "Club HEAL",
    isVerified: true
  },

    {
    title: "Caregiver Support Groups (Dementia)",
    category: "Community Support",
    url: "https://dementia.org.sg/csg/",
    tags: ["dementia", "support", "caregivers"],
    source: "Dementia Singapore",
    isVerified: true
  },

    {
    title: "Cancer Support Groups",
    category: "Community Support",
    url: "https://www.singaporecancersociety.org.sg/get-help/cancer-survivor/join-a-support-group.html",
    tags: ["cancer", "survivor support", "community"],
    source: "Singapore Cancer Society",
    isVerified: true
  },

    {
    title: "Healthy Heart Support Group",
    category: "Community Support",
    url: "https://www.myheart.org.sg/healthy-heart-support-group/",
    tags: ["heart attack", "resources", "survivor support"],
    source: "Singapore Heart Foundation",
    isVerified: true
  },

    {
    title: "Stroke Support Station (S3)",
    category: "Community Support",
    url: "https://s3.org.sg/our-services/care-and-support/",
    tags: ["caregivers", "stroke", "survivor support"],
    source: "Stroke Support Station",
    isVerified: true
  },

    {
    title: "Singapore National Stroke Association (SNSA)",
    category: "Community Support",
    url: "https://www.snsa.org.sg/getsupport/",
    tags: ["caregivers", "stroke", "survivor support"],
    source: "Facebook",
    isVerified: true
  },

  {
    title: "Homage Support Groups",
    category: "Community Support",
    url: "https://www.homage.sg/resources/support-groups-singapore/",
    tags: ["support", "resources"],
    source: "Homeage",
    isVerified: true
  }
];


resources.forEach((resource) => {
  if (!resource.rID) {
    resource.rID = `res_${nanoid(8)}`;
  }
});

async function seedData() {
  try {
    await Resource.deleteMany({});
    for (const res of resources) {
      const resource = new Resource(res);
      await resource.save();
    } // changed this so that it'll run pre("save") hook so that rID would be generated if missing

    console.log("Resources inserted successfully.");
    mongoose.disconnect();
  } catch (err) {
    console.error("Error seeding data:", err);
    mongoose.disconnect();
  }
}
