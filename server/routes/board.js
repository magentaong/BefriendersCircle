const express = require("express");
const router = express.Router();
const Board = require("../models/Board");

//this for storing image
const multer = require("multer");
const fs = require('fs');
const path = require("path");

// Define the uploads directory path (use absolute path)
const uploadsDir = path.join(__dirname,'..', 'uploads');
console.log("Uploads Directory Path:", uploadsDir);  // Check path

// Ensure the uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir);
    console.log('uploads/ directory created');
  } catch (err) {
    console.error('Failed to create uploads/ directory:', err);
    return res.status(500).json({ message: 'Error creating uploads directory' });
  }
} else {
  console.log('uploads/ directory already exists');
}

// Set up storage configuration for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);  // Use the absolute path
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Unique filename using timestamp
  }
});

// Create Multer upload instance with storage settings
const upload = multer({ storage: storage });

// POST /api/upload - Upload image and return URL
router.post('/upload', upload.single('image'), (req, res) => {
  console.error('Uploading......');

  // Check if the file was uploaded
  if (!req.file) {
    console.error('No file uploaded');
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Log the uploaded file details
  console.log('Uploaded file details:', req.file);

  // Generate URL to access the uploaded image
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  // Respond with the image URL
  return res.json(imageUrl);
});

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
    console.log("✅ [1] Received POST /api/boards with body:", req.body);
    const newBoard = new Board(req.body);
    console.log("✅ [2] Constructed new Board object:", newBoard);
    // Log the board data before saving to check the bID (auto-generated)
    await newBoard.save();

     console.log("✅ [3] Board saved:", newBoard);
    res.status(201).json(newBoard);
 } catch (error) {
  console.error("❌ [Board Save Error]:", error);
  res.status(400).json({
    message: "Failed to create board.",
    error: error.message,
    details: error.errors || null,
  });}
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
