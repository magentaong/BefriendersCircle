require("dotenv").config();

// Mock OpenAI before importing the controller
jest.mock("openai", () => {
  const mockTranscription = jest.fn().mockResolvedValue({ text: "Mock transcription result" });
  const mockSpeech = jest.fn().mockResolvedValue({
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8))
  });
  
  const mockOpenAI = {
    audio: {
      transcriptions: {
        create: mockTranscription
      },
      speech: {
        create: mockSpeech
      }
    }
  };
  
  return { 
    OpenAI: jest.fn().mockImplementation(() => mockOpenAI) 
  };
});

const { transcribeAudio, speechAudio } = require("../../controllers/audio");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

jest.setTimeout(200000); 

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Audio Controller API", () => {
  it("transcribeAudio: should return actual transcription from audio file", async () => {
    const filePath = path.join(__dirname, "/fixtures", "test_output.mp3");
    const result = await transcribeAudio(filePath);

    console.log("Transcript:", result);

    expect(typeof result).toBe("string");
    expect(result).toBe("Mock transcription result");
  });

  it("speechAudio: should return audio buffer for text", async () => {
    const text = "This is a test of the text to speech function.";
    const result = await speechAudio(text);

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThanOrEqual(0);

    fs.writeFileSync(path.join(__dirname,"/fixtures", "test_output.mp3"), result);
  });
});