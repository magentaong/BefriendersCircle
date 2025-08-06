const { transcribeAudio, speechAudio } = require("../../controllers/audio");
const {  createReadStream } = require("fs");

jest.mock("fs", () => ({
  createReadStream: jest.fn(() => Buffer.from("mock audio data")),
}));

// mock the openai SDK 
jest.mock("openai", () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => ({
      audio: {
        transcriptions: {
          create: jest.fn().mockResolvedValue({ text: "mock transcript being done" }), //mock .audio.transcription.create
        },
        speech: {
          create: jest.fn().mockResolvedValue({
            arrayBuffer: async () => Uint8Array.from([1, 2, 3]).buffer, //mock .audio.speech.create
          }),
        },
      },
    })),
  };
});

describe("Audio Controller Unit Tests", () => {
  it("transcribeAudio: should return transcription text", async () => {
    const result = await transcribeAudio("mockPath");

    expect(createReadStream).toHaveBeenCalledWith("mockPath");
    expect(result).toBe("mock transcript being done");
  });

  it("speechAudio: should return audio buffer", async () => {
    const result = await speechAudio("I hate unit testing! HMPH");

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });
});

// Qn: No error catching? Or does it not exist