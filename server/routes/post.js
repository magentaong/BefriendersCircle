const express = require("express");
const router = express.Router();
const { getPost, createPost, getPostsByBoardName, getPostDetails, deletePostAndComments} = require("../controllers/post")
// GET /api/post
router.get("/", async (req, res) => {
  try {
    const posts = await getPost();
    res.json(posts);
  } catch (error) {
    res.status(error.status || 500).json({ message: "Failed to fetch posts." });
  }
});

// POST /api/post
router.post("/", async (req, res) => {
  try {
    const newPost = await createPost(req.body);
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creating post:", error); //debugging why my curl not working T^T
    res.status(error.status ||400).json({ message: "Failed to create Post." });
  }
});
router.get('/details/:postId', async (req, res) => {
  try {
    const post = await getPostDetails(req.params.postId);
    console.log("Looking for:", req.params.postId); //debug why cannot fetch jn
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ message: "Failed to fetch post details" });
  }
});

//delete bad post
router.delete('/details/:postId', async (req, res) => {
  try {
    const post = await deletePostAndComments(req.params.postId)
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch post details" });
    } 
  });

// GET /api/post/:catergory
router.get('/:name', async (req, res) => {
  try {
    const result = await getPostsByBoardName(req.params.name)
    res.json(result) 
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ message: "Failed to fetch board" });
  }

});

module.exports = router; 
