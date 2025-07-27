const express = require("express");
const router = express.Router();
const ResourceLike = require("../models/ResourceLike");
const Resource    = require("../models/Resource");

// GET /api/resourceLikes - retrieve all resource likes
router.get("/", async (req, res) => {
  try {
    const resourceLikes = await ResourceLike.find();
    res.json(resourceLikes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch resource likes." });
  }
});

// POST /api/resourceLikes - toggle like/unlike for a resource
router.post("/", async (req, res) => {
  try {
    const { rID } = req.body;
    const cID = req.user?.cID;  // logged-in user ID from token
    
    if (!cID) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!rID) {
      return res.status(400).json({ message: "rID is required." });
    }

    // Verify that the resource exists
    const resource = await Resource.findOne({ rID: rID });
    if (!resource) {
      return res.status(404).json({ message: "Resource not found." });
    }

    // Check for existing like record for this user and resource
    let likeRecord = await ResourceLike.findOne({ rID: rID, cID: cID });
    let message = "";
    if (!likeRecord) {
      // No existing like -> create a new like record
      likeRecord = new ResourceLike({ rID, cID, isLiked: true });
      await likeRecord.save();
      // Increment like count on the resource
      await Resource.findOneAndUpdate({ rID: rID }, { $inc: { likes: 1 } });
      message = "Liked";
      res.status(201).json({ message, like: likeRecord });
    } else {
      // Toggle existing like record
      if (likeRecord.isLiked) {
        // Currently liked -> unlike it
        likeRecord.isLiked = false;
        message = "Unliked";
        await Resource.findOneAndUpdate({ rID: likeRecord.rID }, { $inc: { likes: -1 } });
      } else {
        // Currently unliked -> like it again
        likeRecord.isLiked = true;
        message = "Liked";
        await Resource.findOneAndUpdate({ rID: likeRecord.rID }, { $inc: { likes: 1 } });
      }
      await likeRecord.save();
      res.status(200).json({ message, like: likeRecord });
    }
  } catch (error) {
    console.error("Error toggling resource like:", error);
    res.status(500).json({ message: "Failed to update resource like status." });
  }
});

module.exports = router;
