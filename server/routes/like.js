const express = require("express");
const router = express.Router();
const { toggleLike, getLikeStatus} = require("../controllers/like")

// POST /api/forumlike/toggle
router.post("/toggle", async (req, res) => {
  const { cID, forumID, isPost } = req.body;
  try{ 
      const result = await toggleLike(cID, forumID, isPost);

      res.json(result);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ message: "Failed to toggle like" });
  }
});


// GET /api/forumlike/status
router.get("/status", async (req, res) => {
  const { cID, forumID, isPost } = req.query;
  try{
    const result = await getLikeStatus(cID, forumID, isPost);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch like status" });
  }
});

module.exports = router;
