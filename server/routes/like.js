const express = require("express");
const router = express.Router();
const ForumLike = require("../models/ForumLike");
const Post = require("../models/Post");

// POST /api/forumlike/toggle
router.post("/toggle", async (req, res) => {
  const { cID, forumID, isPost } = req.body;
  if (!cID || !forumID || typeof isPost !== "boolean") {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const existingLike = await ForumLike.findOne({ cID, forumID, isPost });

    if (existingLike) {
      // Unlike: delete the like and decrement likes count on the post
      await ForumLike.deleteOne({ _id: existingLike._id });

      if (isPost) {
        await Post.findOneAndUpdate({ pID: forumID }, { $inc: { likes: -1 } });
      }

      return res.json({ liked: false });
    } else {
      // Like: create the like and increment likes count
      const newLike = new ForumLike({ cID, forumID, isPost, isLiked: true });
      await newLike.save();

      if (isPost) {
        await Post.findOneAndUpdate({ pID: forumID }, { $inc: { likes: 1 } });
      }
      return res.json({ liked: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to toggle like" });
  }
});


// GET /api/forumlike/status
router.get("/status", async (req, res) => {
  const { cID, forumID, isPost } = req.query;
  if (!cID || !forumID || typeof isPost === "undefined") {
    return res.status(400).json({ message: "Missing required query parameters" });
  }
  try {
    const like = await ForumLike.findOne({ 
      cID, 
      forumID, 
      isPost: isPost === 'true' 
    });

    res.json({ liked: !!like });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch like status" });
  }
});

module.exports = router;
