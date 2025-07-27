const express = require("express");
const router = express.Router();
const ForumLike = require("../models/ForumLike");
const Post     = require("../models/Post");
const Comment  = require("../models/Comment");

// GET /api/forumLikes - retrieve all forum likes (for testing or admin purposes)
router.get("/", async (req, res) => {
  try {
    const forumLikes = await ForumLike.find();
    res.json(forumLikes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch forum likes." });
  }
});

// POST /api/forumLikes - toggle like/unlike for a forum post or comment
router.post("/", async (req, res) => {
  try {
    const { forumID, isPost } = req.body;
    const cID = req.user?.cID;  // cID of the logged-in user from auth middleware
    
    if (!cID) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!forumID || typeof isPost === "undefined") {
      return res.status(400).json({ message: "forumID and isPost are required." });
    }

    // Verify that the target post or comment exists
    let target;
    if (isPost) {
      target = await Post.findOne({ pID: forumID });
    } else {
      target = await Comment.findOne({ commID: forumID });
    }
    if (!target) {
      return res.status(404).json({ message: "Target forum post/comment not found." });
    }

    // Find if a like record already exists for this user and forum item
    let likeRecord = await ForumLike.findOne({ forumID: forumID, cID: cID });
    let message = "";
    if (!likeRecord) {
      // No existing like -> create a new like record (user is liking the item)
      likeRecord = new ForumLike({ forumID, cID, isPost, isLiked: true });
      await likeRecord.save();
      // Increment like count on the target post or comment
      if (isPost) {
        await Post.findOneAndUpdate({ pID: forumID }, { $inc: { likes: 1 } });
      } else {
        await Comment.findOneAndUpdate({ commID: forumID }, { $inc: { likes: 1 } });
      }
      message = "Liked";
      res.status(201).json({ message, like: likeRecord });
    } else {
      // Toggle existing like record
      if (likeRecord.isLiked) {
        // Currently liked -> unlike it
        likeRecord.isLiked = false;
        message = "Unliked";
        // Decrement like count on the target
        if (likeRecord.isPost) {
          await Post.findOneAndUpdate({ pID: likeRecord.forumID }, { $inc: { likes: -1 } });
        } else {
          await Comment.findOneAndUpdate({ commID: likeRecord.forumID }, { $inc: { likes: -1 } });
        }
      } else {
        // Currently unliked -> like it again
        likeRecord.isLiked = true;
        message = "Liked";
        // Increment like count on the target
        if (likeRecord.isPost) {
          await Post.findOneAndUpdate({ pID: likeRecord.forumID }, { $inc: { likes: 1 } });
        } else {
          await Comment.findOneAndUpdate({ commID: likeRecord.forumID }, { $inc: { likes: 1 } });
        }
      }
      await likeRecord.save();
      res.status(200).json({ message, like: likeRecord });
    }
  } catch (error) {
    console.error("Error toggling forum like:", error);
    res.status(500).json({ message: "Failed to update like status." });
  }
});

module.exports = router;
