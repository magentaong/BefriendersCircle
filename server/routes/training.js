const express = require("express");
const router = express.Router();
const Training = require("../models/Training");

// GET /api/training 
/*
router.get("/", async (req, res) => {
  try {
    const trainings = await Training.find();
    res.json(trainings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch Training Modules." });
  }
});
*/

// Use to get user progress / status
// GET /api/training/
router.get("/", async (req, res) => {
  const { cID, title } = req.query;

  if (!cID || !title) {
    return res.status(400).json({ message: "Missing cID or title query parameters." });
  }

  try {
    const training = await Training.findOne({
      cID: cID,
      title: title,
    });

    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }

    res.json(training);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch training." });
  }
});

// Update training progress/status for a user, using patch here cause user should only be able to update their progress and status, the rest is up to admins
// PATCH /api/training/:tID
router.patch("/:tID", async (req, res) => {
  try {
    const updatedTraining = await Training.findOneAndUpdate(
      { tID: req.params.tID },
      req.body,
      { new: true }
    );

    if (!updatedTraining) {
      return res.status(404).json({ message: "Training not found." });
    }

    res.json(updatedTraining);
  } catch (error) {
    res.status(400).json({ message: "Failed to update training module." });
  }
});

// Create a new entry in the backend if this user does not have 
// POST /api/training
router.post("/", async (req, res) => {
  console.log("BODY:", req.body);
  const { tID, cID, title, coverImg } = req.body;

  if (!cID || !tID || !title) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const existing = await Training.findOne({ cID, title });

    if (existing) {
      return res.status(200).json({
        message: "Training already exists",
        training: existing,
      });
    }

    // Create new training if not found
    const newTraining = new Training({
      tID,
      cID,
      title,
      coverImg: coverImg || null,
      status: false,
      progress: 0,
    });

    const saved = await newTraining.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Create Training Error:", error); // temp log
    res.status(400).json({ message: "Failed to create training module." });
  }
});

module.exports = router; 
