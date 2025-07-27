const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");

// GET /api/comment
router.get("/", async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch comment." });
  }
});

// POST /api/comment
router.post("/", async (req, res) => {
  try {
    const newComment = new Comment(req.body);
    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error creating comment:", error); //debugging why my curl not working T^T
    res.status(400).json({ message: "Failed to create comment." });
  }
});

// GET /api/comment/:pId
router.get('/:pId', async (req, res) => {
  const { pId } = req.params;
  try {
    const comment = await Comment.find({ pID: pId });
    console.log(pId);
    res.json(comment); // Send the board data and bID as a JSON response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch board" });
  }
});

module.exports = router; 
