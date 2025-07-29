const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Board = require("../models/Board");
const Comment = require("../models/Comment");

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

// GET /api/post/:catergory
router.get('/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const board = await Board.findOne({ name: name });
    console.log(board.bID);
    const post = await Post.find({ bID: board.bID });
    const comments = await Comment.find({ pID: post.pID });
    res.json({
      bID: board.bID,
      posts: post,
      comments: comments
    }); // Send the board data and bID as a JSON response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch board" });
  }
});

module.exports = router; 

//newly added
router.get('/details/:postId', async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findOne({ pID: postId });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comments = await Comment.find({ pID: postId });

    res.json({ post, comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch post details" });
  }
});

//delete bad post
router.delete('/details/:postId', async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.deleteOne({ pID: postId });
    
    // If no document was deleted
    if (post.deletedCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comments = await Comment.deleteMany({ pID: postId });

    res.json({ message: "Post and Comment deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch post details" });
  }
});

module.exports = router; 
