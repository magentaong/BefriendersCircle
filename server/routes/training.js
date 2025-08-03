const express = require("express");
const router = express.Router();
const Training = require("../models/Training");
const {getTrainingByCIDAndTitle,updateTraining, createTraining,} = require("../controllers/training")

// Use to get user progress / status
// GET /api/training/
router.get("/", async (req, res) => {
  try {
    const training = await getTrainingByCIDAndTitle(req.query.cID, req.query.title);
    res.json(training);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

// Update training progress/status for a user, using patch here cause user should only be able to update their progress and status, the rest is up to admins
// PATCH /api/training/:tID
router.patch("/:tID", async (req, res) => {
  try {
    const updated = await updateTraining(req.params.tID, req.body);
    res.json(updated);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});

// Create a new entry in the backend if this user does not have 
// POST /api/training
router.post("/", async (req, res) => {
  try {
    const result = await createTraining(req.body);
    if (result.exists) {
      return res.status(200).json({
        message: "Training already exists",
        training: result.training,
      });
    }
    res.status(201).json(result.training);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});

module.exports = router; 
