const express = require("express");
const router = express.Router();
const Training = require("../models/Training");

// GET /api/training
router.get("/", async (req, res) => {
  try {
    const trainings = await Training.find();
    res.json(trainings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch Training Modules." });
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



module.exports = router; 
