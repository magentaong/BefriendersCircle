const express = require("express");
const multer = require("multer");
const { readFileSync, unlinkSync } = require("fs");
const OpenAI = require("openai");

const router = express.Router();
const upload = multer({ dest: "uploads/" });
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Transcribing audio file, speech to text
router.post("/transcribe", upload.single("file"), async (req, res) => {
  try {
    const transcription = await client.audio.transcriptions.create({
      model: "gpt-4o-mini-transcribe",
      file: readFileSync(req.file.path),
    });

    res.json({ text: transcription.text });
    unlinkSync(req.file.path);
  } catch (error) {
    console.error("Transcription Error:", error);
    res.status(500).json({ error: "Transcription failed." });
  }
});

// Generate speech from text (text-to-speech)
router.post("/speak", async (req, res) => {
  try {
    const { text } = req.body;
    const response = await client.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy", // alloy, verse, shimmer, etc.
      input: text,
    });

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(audioBuffer);
  } catch (error) {
    console.error("TTS Error:", error);
    res.status(500).json({ error: "Text-to-speech failed." });
  }
});

module.exports = router;
