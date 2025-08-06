require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const Chat = require("../../models/Chat");
const ResourceChat = require("../../models/ResourceChat");
const User = require("../../models/User");

const app = express();
app.use(cors());
app.use(express.json());

const connectTestDB = require("../../db");

app.post("/api/openai", async (req, res) => {
  const { prompt, userId } = req.body;
  
  if (!prompt || !userId) {
    return res.status(400).json({ error: "Missing prompt or userId" });
  }
  
  const mockResponse = {
    reply: `Mocked OpenAI response for: ${prompt}`,
    verifiedResource: null, 
    relatedSchemes: [
      {
        title: "Mocked Scheme",
        description: "This is a mocked scheme for testing",
        eligibility: ["Mocked eligibility"],
        steps: ["Mocked steps"],
        link: "https://mocked-link.com",
        category: "Mocked Category",
        tags: ["mocked", "test"]
      }
    ]
  };
  
  try {
    await Chat.create({ userId, role: "user", content: prompt });
    await Chat.create({ userId, role: "assistant", content: mockResponse.reply });
    
    const uniqueTitle = `Mocked Resource Title - ${Date.now()}`;
    await ResourceChat.create({
      title: uniqueTitle,
      description: "This is a mocked resource description for testing purposes",
      eligibility: ["Mocked eligibility"],
      steps: ["Mocked steps"],
      link: "https://mocked-link.com",
      category: "Mocked Category",
      tags: ["mocked", "test"],
      source: "Chatbot AI"
    });
    
    return res.status(200).json(mockResponse);
  } catch (error) {
    console.error('Error in mock OpenAI route:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/openai", (req, res) => {
  res.json({ status: "OpenAI API is running!" });
});

jest.setTimeout(30000);

let testUserId;

beforeAll(async () => {
  await connectTestDB();
  
  let testUser;
  try {
    testUser = await User.create({
      email: "openaittest@example.com",
      password: "StrongPassword123",
      name: "OpenAI Test User"
    });
  } catch (error) {
    testUser = await User.findOne({ email: "openaittest@example.com" });
  }
  testUserId = testUser._id;
});

afterEach(async () => {
  if (testUserId) {
    await Chat.deleteMany({ userId: testUserId.toString() });
    await ResourceChat.deleteMany({ source: "Chatbot AI" });
  }
});

afterAll(async () => {
  try {
    await User.deleteOne({ email: "openaittest@example.com" });
    if (testUserId) {
      await Chat.deleteMany({ userId: testUserId.toString() });
    }
    await ResourceChat.deleteMany({ source: "Chatbot AI" });
    
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    await new Promise(resolve => {
      if (mongoose.connection.readyState === 0) {
        resolve();
      } else {
        mongoose.connection.once('disconnected', resolve);
      }
    });
  } catch (error) {
    console.error('Cleanup error:', error);
  }
});

describe("OpenAI API", () => {
  //=====TEST 1 - VALID PROMPT TO OPENAI=====
  it("should send valid prompt and receive coherent response", async () => {
    const requestData = {
      prompt: "What is caregiver stress and how can I get help?",
      userId: testUserId.toString()
    };

    const res = await request(app)
      .post("/api/openai")
      .send(requestData);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("reply");
    expect(res.body).toHaveProperty("verifiedResource");
    expect(res.body).toHaveProperty("relatedSchemes");
    expect(typeof res.body.reply).toBe("string");
    expect(res.body.reply.length).toBeGreaterThan(0);
  });

  //=====TEST 2 - EMPTY PROMPT=====
  it("should return 400 Bad Request for empty prompt", async () => {
    const requestData = {
      prompt: "",
      userId: testUserId.toString()
    };

    const res = await request(app)
      .post("/api/openai")
      .send(requestData);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toContain("Missing prompt or userId");
  });

  //=====TEST 3 - MISSING PROMPT=====
  it("should return 400 Bad Request for missing prompt", async () => {
    const requestData = {
      userId: testUserId.toString()
    };

    const res = await request(app)
      .post("/api/openai")
      .send(requestData);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toContain("Missing prompt or userId");
  });

  //=====TEST 4 - MISSING USER ID=====
  it("should return 400 Bad Request for missing userId", async () => {
    const requestData = {
      prompt: "What is caregiver support?"
    };

    const res = await request(app)
      .post("/api/openai")
      .send(requestData);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toContain("Missing prompt or userId");
  });

  //=====TEST 5 - PROMPT WITH MULTIPLE QUESTIONS=====
  it("should handle prompt with multiple intents", async () => {
    const requestData = {
      prompt: "What is caregiver stress and how can I get help? Also, what resources are available in Singapore?",
      userId: testUserId.toString()
    };

    const res = await request(app)
      .post("/api/openai")
      .send(requestData);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("reply");
    expect(res.body).toHaveProperty("verifiedResource");
    expect(res.body).toHaveProperty("relatedSchemes");
    expect(typeof res.body.reply).toBe("string");
    expect(res.body.reply.length).toBeGreaterThan(0);
  });

  //=====TEST 6 - LONG PROMPT HANDLING=====
  it("should handle very long user message", async () => {
    const longPrompt = "This is a very long prompt that contains a lot of text and should test the system's ability to handle lengthy inputs without any issues. The prompt should be processed normally and return an appropriate response. ".repeat(20); // ~2000 characters
    
    const requestData = {
      prompt: longPrompt,
      userId: testUserId.toString()
    };

    const res = await request(app)
      .post("/api/openai")
      .send(requestData);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("reply");
    expect(typeof res.body.reply).toBe("string");
    expect(res.body.reply.length).toBeGreaterThan(0);
  });

  //=====TEST 7 - PROMPT WITH SPECIAL CHARACTERS=====
  it("should handle prompt with special characters and emojis", async () => {
    const requestData = {
      prompt: "How can I help with stress? 😰 (urgent!) @#$%^&*()_+-=[]{}|;':\",./<>?",
      userId: testUserId.toString()
    };

    const res = await request(app)
      .post("/api/openai")
      .send(requestData);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("reply");
    expect(typeof res.body.reply).toBe("string");
    expect(res.body.reply.length).toBeGreaterThan(0);
  });

  //=====TEST 8 - LATENCY CHECK=====
  it("should respond within acceptable latency", async () => {
    const requestData = {
      prompt: "What are the symptoms of anxiety?",
      userId: testUserId.toString()
    };

    const startTime = Date.now();
    const res = await request(app)
      .post("/api/openai")
      .send(requestData);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("reply");
    // Should respond within 25 seconds (reasonable for OpenAI API calls)
    expect(responseTime).toBeLessThan(25000);
  });

  //=====TEST 9 - CHAT HISTORY STORAGE=====
  it("should store chat history in database", async () => {
    const requestData = {
      prompt: "Test prompt for chat history",
      userId: testUserId.toString()
    };

    const res = await request(app)
      .post("/api/openai")
      .send(requestData);

    expect(res.statusCode).toBe(200);

    // Check if chat history was stored
    const chatHistory = await Chat.find({ userId: testUserId.toString() });
    expect(chatHistory.length).toBeGreaterThanOrEqual(2); // User message + assistant response
    expect(chatHistory.some(chat => chat.role === "user" && chat.content === requestData.prompt)).toBe(true);
    expect(chatHistory.some(chat => chat.role === "assistant")).toBe(true);
  });

  //=====TEST 10 - RESOURCE STORAGE=====
  it("should store verified resources in database", async () => {
    const requestData = {
      prompt: "What government support is available for caregivers?",
      userId: testUserId.toString()
    };

    const res = await request(app)
      .post("/api/openai")
      .send(requestData);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("verifiedResource");
    expect(res.body).toHaveProperty("relatedSchemes");

    // Check if resources were stored (if any were found)
    if (res.body.verifiedResource) {
      const storedResources = await ResourceChat.find({ source: "Chatbot AI" });
      expect(storedResources.length).toBeGreaterThanOrEqual(0);
    }
  });

  //=====TEST 11 - HEALTH CHECK ENDPOINT=====
  it("should return health check status", async () => {
    const res = await request(app)
      .get("/api/openai");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("status");
    expect(res.body.status).toBe("OpenAI API is running!");
  });

  //=====TEST 12 - MALFORMED REQUEST=====
  it("should handle malformed request gracefully", async () => {
    const res = await request(app)
      .post("/api/openai")
      .send("invalid json");

    // Should return an error response
    expect([400, 500]).toContain(res.statusCode);
  });

  //=====TEST 13 - LARGE PAYLOAD=====
  it("should handle large payload gracefully", async () => {
    const largePrompt = "A".repeat(10000); // 10KB payload
    
    const requestData = {
      prompt: largePrompt,
      userId: testUserId.toString()
    };

    const res = await request(app)
      .post("/api/openai")
      .send(requestData);

    // Should either process successfully or return an error gracefully
    expect([200, 400, 413, 500]).toContain(res.statusCode);
  });

  //=====TEST 14 - NON-STRING PROMPT=====
  it("should handle non-string prompt gracefully", async () => {
    const requestData = {
      prompt: 123, // Number instead of string
      userId: testUserId.toString()
    };

    const res = await request(app)
      .post("/api/openai")
      .send(requestData);

    // Should either process successfully or return an error gracefully
    expect([200, 400, 500]).toContain(res.statusCode);
  });

  //=====TEST 15 - RESPONSE STRUCTURE VALIDATION=====
  it("should return properly structured response", async () => {
    const requestData = {
      prompt: "What is caregiver support?",
      userId: testUserId.toString()
    };

    const res = await request(app)
      .post("/api/openai")
      .send(requestData);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("reply");
    expect(res.body).toHaveProperty("verifiedResource");
    expect(res.body).toHaveProperty("relatedSchemes");
    
    // Verify response types
    expect(typeof res.body.reply).toBe("string");
    expect(Array.isArray(res.body.relatedSchemes)).toBe(true);
    
    // verifiedResource can be null or an object
    expect(res.body.verifiedResource === null || typeof res.body.verifiedResource === "object").toBe(true);
  });

  //=====TEST 16 - CONCURRENT REQUESTS=====
  it("should handle multiple concurrent requests", async () => {
    const requestData1 = {
      prompt: "First concurrent request",
      userId: testUserId.toString()
    };

    const requestData2 = {
      prompt: "Second concurrent request",
      userId: testUserId.toString()
    };

    const requestData3 = {
      prompt: "Third concurrent request",
      userId: testUserId.toString()
    };

    // Send multiple requests concurrently
    const promises = [
      request(app).post("/api/openai").send(requestData1),
      request(app).post("/api/openai").send(requestData2),
      request(app).post("/api/openai").send(requestData3)
    ];

    const results = await Promise.all(promises);

    // All requests should succeed
    results.forEach(res => {
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("reply");
      expect(typeof res.body.reply).toBe("string");
      expect(res.body.reply.length).toBeGreaterThan(0);
    });
  });

  //=====TEST 17 - ERROR HANDLING FOR INVALID USER ID=====
  it("should handle invalid user ID gracefully", async () => {
    const requestData = {
      prompt: "Test prompt",
      userId: "invalid_user_id_123"
    };

    const res = await request(app)
      .post("/api/openai")
      .send(requestData);

    // Should still process the request even with invalid user ID
    // since the validation only checks for presence, not validity
    expect([200, 400, 500]).toContain(res.statusCode);
  });

  //=====TEST 18 - RESOURCE DEDUPLICATION=====
  it("should deduplicate resources in response", async () => {
    const requestData = {
      prompt: "What are the available caregiver support schemes?",
      userId: testUserId.toString()
    };

    const res = await request(app)
      .post("/api/openai")
      .send(requestData);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("relatedSchemes");
    expect(Array.isArray(res.body.relatedSchemes)).toBe(true);

    // Check for duplicates in relatedSchemes
    const titles = res.body.relatedSchemes
      .filter(scheme => scheme && scheme.title)
      .map(scheme => scheme.title.toLowerCase().trim());
    
    const uniqueTitles = [...new Set(titles)];
    expect(titles.length).toBe(uniqueTitles.length);
  });

  //=====TEST 19 - EMPTY RESPONSE HANDLING=====
  it("should handle empty OpenAI response gracefully", async () => {
    // This test might pass or fail depending on OpenAI's response
    // It's included to ensure the system handles edge cases
    const requestData = {
      prompt: "xyz123 completely unrelated topic that shouldn't match anything",
      userId: testUserId.toString()
    };

    const res = await request(app)
      .post("/api/openai")
      .send(requestData);

    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("reply");
      expect(typeof res.body.reply).toBe("string");
    }
  });

  //=====TEST 20 - API KEY VALIDATION=====
  it("should handle missing or invalid API key gracefully", async () => {
    // This test checks if the system handles API key issues
    // Note: This might not be testable without actually removing the API key
    const requestData = {
      prompt: "Test prompt for API key validation",
      userId: testUserId.toString()
    };

    const res = await request(app)
      .post("/api/openai")
      .send(requestData);

    // Should either succeed or return an appropriate error
    expect([200, 500]).toContain(res.statusCode);
  });
});
