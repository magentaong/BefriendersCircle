const express = require("express");
const router = express.Router();
const Board = require("../models/Board");

// GET /api/boards
router.get("/", async (req, res) => {
  try {
    const boards = await Board.find();
    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch boards." });
  }
});

// POST /api/boards
router.post("/", async (req, res) => {
  try {
    const newBoard = new Board(req.body);
    await newBoard.save();
    res.status(201).json(newBoard);
  } catch (error) {
    res.status(400).json({ message: "Failed to create board." });
  }
});

// GET /api/boards/:catergory
router.get('/:category', async (req, res) => {
  const { category } = req.params;
  console.log(`Fetching data for category: ${category}`);
  try {
    const board = await Board.find({ category: category });
    console.log(board);
    res.json(board); // Send the board data as a JSON response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch board" });
  }
});

module.exports = router; 
