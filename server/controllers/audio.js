const { OpenAI } = require("openai");
const { readFileSync } = require("fs");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function transcribeAudio(filePath) {
  const result = await client.audio.transcriptions.create({
    model: "gpt-4o-mini-transcribe",
    file: readFileSync(filePath),
  });

  return result.text;
}

async function speechAudio(text) {
    const response = await client.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: "alloy", 
        input: text,
    });

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    return audioBuffer;
}

module.exports = { transcribeAudio, speechAudio }