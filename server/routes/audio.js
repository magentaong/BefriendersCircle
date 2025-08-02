const express = require("express");
const multer = require("multer");
const { unlinkSync } = require("fs");
const { transcribeAudio, speechAudio } = require("../controllers/audio");
const router = express.Router();
const upload = multer({ dest: "uploads/" });


// Transcribing audio file, speech to text
router.post("/transcribe", upload.single("file"), async (req, res) => {
  try {
    const text = await transcribeAudio(req.file.path);
    unlinkSync(req.file.path);
    res.json({ text });
  } catch (error) {
    console.error("Transcription Error:", error);
    res.status(500).json({ error: "Transcription failed." });
  }
});

// Generate speech from text (text-to-speech)
router.post("/speak", async (req, res) => {
  try {
    const { text } = req.body;
    const audioBuffer = await speechAudio(text);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", audioBuffer.length);
    res.send(audioBuffer);
  } catch (error) {
    console.error("TTS Error:", error);
    res.status(500).json({ error: "Text-to-speech failed." });
  }
});

module.exports = router;
