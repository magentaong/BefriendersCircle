const { OpenAI } = require("openai"); // OpenAI SDK for audio processing
const { createReadStream } = require("fs"); // Read audio files
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Convert audio files to text using OpenAI 
async function transcribeAudio(filePath) {
  // Call OpenAI transcription API
  const result = await client.audio.transcriptions.create({
    model: "gpt-4o-mini-transcribe", // Specify transcription model
    file: createReadStream(filePath), // Readable stream from audio file path
  });

  // Return transcribed text from API response
  return result.text;
}

// Convert TTS using OpenAI
async function speechAudio(text) {
    const response = await client.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: "alloy", 
        input: text,
    });

    // convert audio response to a buffer for Node.js compatibility
    // Get the raw audio data as an ArrayBuffer
    const audioBuffer = Buffer.from(await response.arrayBuffer());
    return audioBuffer;
}

module.exports = { transcribeAudio, speechAudio }