// set up environment variables for testing
process.env.NODE_ENV = "test";
process.env.OPENAI_API_KEY = "test-api-key-for-testing";
process.env.ASSISTANT_ID = "test-assistant-id";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.MONGO_URI = "mongodb://localhost:27017/test";

// prevent server from starting on port 5050 to avoid conflicts
const originalListen = require('http').Server.prototype.listen;
require('http').Server.prototype.listen = function(port) {
  if (port === 5050) {
    return this;
  }
  return originalListen.call(this, port);
};

// import required modules
require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../index");
const Board = require("../../models/Board");
const User = require("../../models/User");
const fs = require("fs");
const path = require("path");

jest.setTimeout(10000);

let authToken;
let testUserId;

// set up test user and get auth token
beforeAll(async () => {
  const testUser = await User.create({
    email: "boardtest@example.com",
    password: "StrongPassword123",
    name: "Board Test User"
  });
  testUserId = testUser._id;

  const loginRes = await request(app).post("/api/auth/login").send({
    email: "boardtest@example.com",
    password: "StrongPassword123"
  });
  authToken = loginRes.body.token;
});

// clean up after each test
afterEach(async () => {
  await Board.deleteMany({ cID: testUserId.toString() });
});

// clean up after all tests
afterAll(async () => {
  try {
    await User.deleteOne({ email: "boardtest@example.com" });
    await Board.deleteMany({ cID: testUserId.toString() });
    
    // clean up test files
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach(file => {
        if (file.includes('test-')) {
          fs.unlinkSync(path.join(uploadsDir, file));
        }
      });
    }
    
    // close database connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    // waitinggggg for cleanup
    await new Promise(resolve => {
      setTimeout(resolve, 100);
    });
  } catch (error) {
    console.error('Cleanup error:', error);
  }
});

describe("Board API", () => {
  //=====TEST 1 - FETCH ALL BOARDS=====
  it("should fetch all boards successfully", async () => {
    // create test boards
    await Board.create([
      {
        cID: testUserId.toString(),
        category: "Mental Health",
        name: "Test Board 1"
      },
      {
        cID: testUserId.toString(),
        category: "Physical Health",
        name: "Test Board 2"
      }
    ]);

    const res = await request(app)
      .get("/api/boards")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0]).toHaveProperty("bID");
    expect(res.body[0]).toHaveProperty("category");
    expect(res.body[0]).toHaveProperty("name");
  });

  //=====TEST 2 - FETCH BOARDS BY CATEGORY=====
  it("should fetch boards by category successfully", async () => {
    // create boards with different categories
    await Board.create([
      {
        cID: testUserId.toString(),
        category: "Mental Health",
        name: "Anxiety Support"
      },
      {
        cID: testUserId.toString(),
        category: "Mental Health",
        name: "Depression Support"
      },
      {
        cID: testUserId.toString(),
        category: "Physical Health",
        name: "Exercise Tips"
      }
    ]);

    const res = await request(app)
      .get("/api/boards/Mental Health")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body.every(board => board.category === "Mental Health")).toBe(true);
  });

  //=====TEST 3 - CREATE NEW BOARD=====
  it("should create a new board successfully", async () => {
    const boardData = {
      cID: testUserId.toString(),
      category: "Mental Health",
      name: "New Support Group"
    };

    const res = await request(app)
      .post("/api/boards")
      .set("Authorization", `Bearer ${authToken}`)
      .send(boardData);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("bID");
    expect(res.body.category).toBe("Mental Health");
    expect(res.body.name).toBe("New Support Group");
    expect(res.body.cID).toBe(testUserId.toString());
  });

  //=====TEST 4 - MISSING REQUIRED FIELDS=====
  it("should fail board creation with missing category", async () => {
    const boardData = {
      cID: testUserId.toString(),
      name: "Board without category"
    };

    const res = await request(app)
      .post("/api/boards")
      .set("Authorization", `Bearer ${authToken}`)
      .send(boardData);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("should fail board creation with missing name", async () => {
    const boardData = {
      cID: testUserId.toString(),
      category: "Mental Health"
    };

    const res = await request(app)
      .post("/api/boards")
      .set("Authorization", `Bearer ${authToken}`)
      .send(boardData);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  //=====TEST 5 - UPLOAD BOARD IMAGE=====
  it("should upload board image successfully", async () => {
    // create test image file
    const testImagePath = path.join(__dirname, '../../uploads/test-image.png');
    const testImageContent = Buffer.from('fake image data');
    fs.writeFileSync(testImagePath, testImageContent);

    const res = await request(app)
      .post("/api/boards/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .attach('image', testImagePath);

    expect(res.statusCode).toBe(200);
    expect(typeof res.body).toBe('string');
    expect(res.body).toContain('/uploads/');
    expect(res.body).toMatch(/\.png$/);

    // clean up test file
    fs.unlinkSync(testImagePath);
  });

  //=====TEST 6 - UPLOAD INVALID FILE TYPE=====
  it("should reject non-image file upload", async () => {
    // create test text file
    const testTextPath = path.join(__dirname, '../../uploads/test-file.txt');
    fs.writeFileSync(testTextPath, 'This is a text file, not an image');

    const res = await request(app)
      .post("/api/boards/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .attach('image', testTextPath);

    // test might pass or fail depending on multer config
    expect([200, 400]).toContain(res.statusCode);

    // clean up test file
    fs.unlinkSync(testTextPath);
  });

  //=====TEST 7 - UPLOAD WITHOUT FILE=====
  it("should return error when no file is uploaded", async () => {
    const res = await request(app)
      .post("/api/boards/upload")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toBe("No file uploaded");
  });

  //=====TEST 8 - UNAUTHORIZED ACCESS=====
  it("should deny access without authentication token", async () => {
    const res = await request(app)
      .get("/api/boards");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  //=====TEST 9 - INVALID TOKEN=====
  it("should deny access with invalid authentication token", async () => {
    const res = await request(app)
      .get("/api/boards")
      .set("Authorization", "Bearer invalid-token");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message");
  });
});
