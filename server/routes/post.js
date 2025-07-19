const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// GET /api/post
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch posts." });
  }
});

// POST /api/post
router.post("/", async (req, res) => {
  try {
    const newPost = new Post(req.body);
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creating post:", error); //debugging why my curl not working T^T
    res.status(400).json({ message: "Failed to create Post." });
  }
});

module.exports = router; 
