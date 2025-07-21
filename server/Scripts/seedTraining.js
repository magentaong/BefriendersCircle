// to test training apis, in future here should be where the data for training is at i think.. 

const mongoose = require("mongoose");
require("dotenv").config();
const Training = require("../models/Training");

const seedData = [
  {
    tID: "training-001",
    cID: "system", // placeholder caregiver ID or "admin"
    title: "Fall Prevention Basics",
    coverImg: "https://example.com/fall.png",
    status: false,
    progress: 0
  },
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    
    const inserted = await Training.insertMany(seedData);
    console.log(`Seeded ${inserted.length} training modules.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("MongoDB connection failed", err);
    process.exit(1);
  });
