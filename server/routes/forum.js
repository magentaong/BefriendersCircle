const express = require("express");
const Forum = require("forum");
require("dotenv").config();

const router = express.Router();

const forum = new Forum({ apiKey: process.env.Forum_API_KEY });

router.get("/", (req, res) => {
  res.json({ status: "Forum API is running!" });
});

router.post("/", async (req, res) => {
  
});

module.exports = router;
