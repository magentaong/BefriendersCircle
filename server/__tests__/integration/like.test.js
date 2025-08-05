
process.env.NODE_ENV = "test";
process.env.OPENAI_API_KEY = "sk-test-key-for-testing-only";
process.env.ASSISTANT_ID = "test-assistant-id";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.MONGO_URI = "mongodb://localhost:27017/test";
process.env.PORT = "5053";

// Mock the server startup to prevent port conflicts
const originalListen = require('http').Server.prototype.listen;
require('http').Server.prototype.listen = function(port) {
  // Only prevent server from starting if it's the default port
  if (port === 5050) {
    return this;
  }
  // Allow the server to start for testing
  return originalListen.call(this, port);
};

require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../index");
const ForumLike = require("../../models/ForumLike");
const Post = require("../../models/Post");
const User = require("../../models/User");

jest.setTimeout(10000);

let authToken;
let testUserId;
let testPostId;

// Setup: Create a test user, post, and get auth token
beforeAll(async () => {
  // Create a test user
  const testUser = await User.create({
    email: "liketest@example.com",
    password: "StrongPassword123",
    name: "Like Test User"
  });
  testUserId = testUser._id;

  // Login to get auth token
  const loginRes = await request(app).post("/api/auth/login").send({
    email: "liketest@example.com",
    password: "StrongPassword123"
  });
  authToken = loginRes.body.token;

  // Create a test post for liking
  const testPost = await Post.create({
    bID: "test_board_123",
    cID: testUserId.toString(),
    message: "Test post for likes",
    likes: 0
  });
  testPostId = testPost.pID;
});

// Cleanup after each test
afterEach(async () => {
  await ForumLike.deleteMany({ cID: testUserId.toString() });
  // Reset post likes to 0 after each test
  await Post.findOneAndUpdate({ pID: testPostId }, { likes: 0 });
});

// Cleanup after all tests
afterAll(async () => {
  try {
    await User.deleteOne({ email: "liketest@example.com" });
    await Post.deleteOne({ pID: testPostId });
    await ForumLike.deleteMany({ cID: testUserId.toString() });
    
    // Close mongoose connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    // Force close any remaining handles
    await new Promise(resolve => {
      setTimeout(resolve, 100);
    });
  } catch (error) {
    console.error('Cleanup error:', error);
  }
});

describe("Like API", () => {
  // Test 1: Like a Post
  it("should like a post and increase like count", async () => {
    const likeData = {
      cID: testUserId.toString(),
      forumID: testPostId,
      isPost: true
    };

    const res = await request(app)
      .post("/api/like/toggle")
      .send(likeData);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("liked");
    expect(res.body.liked).toBe(true);

    // Verify like was created in database
    const likeRecord = await ForumLike.findOne({ 
      cID: testUserId.toString(), 
      forumID: testPostId, 
      isPost: true 
    });
    expect(likeRecord).toBeTruthy();
    expect(likeRecord.isLiked).toBe(true);

    // Verify post like count increased
    const updatedPost = await Post.findOne({ pID: testPostId });
    expect(updatedPost.likes).toBe(1);
  });

  // Test 2: Like Already Liked Post
  it("should prevent duplicate likes by same user on same post", async () => {
    const likeData = {
      cID: testUserId.toString(),
      forumID: testPostId,
      isPost: true
    };

    // First like
    const res1 = await request(app)
      .post("/api/like/toggle")
      .send(likeData);

    expect(res1.statusCode).toBe(200);
    expect(res1.body.liked).toBe(true);

    // Second like (should unlike instead)
    const res2 = await request(app)
      .post("/api/like/toggle")
      .send(likeData);

    expect(res2.statusCode).toBe(200);
    expect(res2.body.liked).toBe(false);

    // Verify like was removed from database
    const likeRecord = await ForumLike.findOne({ 
      cID: testUserId.toString(), 
      forumID: testPostId, 
      isPost: true 
    });
    expect(likeRecord).toBeNull();

    // Verify post like count decreased
    const updatedPost = await Post.findOne({ pID: testPostId });
    expect(updatedPost.likes).toBe(0);
  });

  // Test 3: Unlike a Post
  it("should unlike a previously liked post and decrease like count", async () => {
    const likeData = {
      cID: testUserId.toString(),
      forumID: testPostId,
      isPost: true
    };

    // First like the post
    await request(app)
      .post("/api/like/toggle")
      .send(likeData);

    // Verify post has 1 like
    let post = await Post.findOne({ pID: testPostId });
    expect(post.likes).toBe(1);

    // Now unlike the post
    const res = await request(app)
      .post("/api/like/toggle")
      .send(likeData);

    expect(res.statusCode).toBe(200);
    expect(res.body.liked).toBe(false);

    // Verify like was removed from database
    const likeRecord = await ForumLike.findOne({ 
      cID: testUserId.toString(), 
      forumID: testPostId, 
      isPost: true 
    });
    expect(likeRecord).toBeNull();

    // Verify post like count decreased
    post = await Post.findOne({ pID: testPostId });
    expect(post.likes).toBe(0);
  });

  // Test 4: Like Post - Invalid Post ID
  it("should handle invalid post ID gracefully", async () => {
    const likeData = {
      cID: testUserId.toString(),
      forumID: "invalid_post_id_123",
      isPost: true
    };

    const res = await request(app)
      .post("/api/like/toggle")
      .send(likeData);

    // Should still succeed in creating the like record
    // since the validation is only on the required fields
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("liked");
    expect(res.body.liked).toBe(true);

    // Verify like was created in database
    const likeRecord = await ForumLike.findOne({ 
      cID: testUserId.toString(), 
      forumID: "invalid_post_id_123", 
      isPost: true 
    });
    expect(likeRecord).toBeTruthy();
  });

  // Test 5: Get Like Status
  it("should return correct like status for a post", async () => {
    const likeData = {
      cID: testUserId.toString(),
      forumID: testPostId,
      isPost: true
    };

    // Check initial status (should be unliked)
    let res = await request(app)
      .get("/api/like/status")
      .query({
        cID: testUserId.toString(),
        forumID: testPostId,
        isPost: "true"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("liked");
    expect(res.body.liked).toBe(false);

    // Like the post
    await request(app)
      .post("/api/like/toggle")
      .send(likeData);

    // Check status again (should be liked)
    res = await request(app)
      .get("/api/like/status")
      .query({
        cID: testUserId.toString(),
        forumID: testPostId,
        isPost: "true"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.liked).toBe(true);
  });

  // Test 6: Missing Required Fields
  it("should fail with missing cID", async () => {
    const likeData = {
      forumID: testPostId,
      isPost: true
    };

    const res = await request(app)
      .post("/api/like/toggle")
      .send(likeData);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("should fail with missing forumID", async () => {
    const likeData = {
      cID: testUserId.toString(),
      isPost: true
    };

    const res = await request(app)
      .post("/api/like/toggle")
      .send(likeData);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("should fail with missing isPost", async () => {
    const likeData = {
      cID: testUserId.toString(),
      forumID: testPostId
    };

    const res = await request(app)
      .post("/api/like/toggle")
      .send(likeData);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("should fail with invalid isPost type", async () => {
    const likeData = {
      cID: testUserId.toString(),
      forumID: testPostId,
      isPost: "true" // Should be boolean, not string
    };

    const res = await request(app)
      .post("/api/like/toggle")
      .send(likeData);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  // Test 7: Multiple Users Like Same Post
  it("should allow multiple users to like the same post", async () => {
    // Create a second test user (handle potential duplicate)
    let secondUser;
    try {
      secondUser = await User.create({
        email: "liketest2@example.com",
        password: "StrongPassword123",
        name: "Like Test User 2"
      });
    } catch (error) {
      // If user already exists, find and use it
      secondUser = await User.findOne({ email: "liketest2@example.com" });
    }

    const likeData1 = {
      cID: testUserId.toString(),
      forumID: testPostId,
      isPost: true
    };

    const likeData2 = {
      cID: secondUser._id.toString(),
      forumID: testPostId,
      isPost: true
    };

    // First user likes the post
    const res1 = await request(app)
      .post("/api/like/toggle")
      .send(likeData1);

    expect(res1.statusCode).toBe(200);
    expect(res1.body.liked).toBe(true);

    // Second user likes the post
    const res2 = await request(app)
      .post("/api/like/toggle")
      .send(likeData2);

    expect(res2.statusCode).toBe(200);
    expect(res2.body.liked).toBe(true);

    // Verify both likes exist in database
    const likes = await ForumLike.find({ forumID: testPostId, isPost: true });
    expect(likes.length).toBe(2);

    // Verify post like count is 2
    const post = await Post.findOne({ pID: testPostId });
    expect(post.likes).toBe(2);

    // Clean up second user
    await User.deleteOne({ email: "liketest2@example.com" });
    await ForumLike.deleteMany({ cID: secondUser._id.toString() });
  });

  // Test 8: Like Comment (isPost: false)
  it("should handle liking comments", async () => {
    const commentLikeData = {
      cID: testUserId.toString(),
      forumID: "test_comment_123",
      isPost: false
    };

    const res = await request(app)
      .post("/api/like/toggle")
      .send(commentLikeData);

    expect(res.statusCode).toBe(200);
    expect(res.body.liked).toBe(true);

    // Verify like was created in database
    const likeRecord = await ForumLike.findOne({ 
      cID: testUserId.toString(), 
      forumID: "test_comment_123", 
      isPost: false 
    });
    expect(likeRecord).toBeTruthy();
    expect(likeRecord.isLiked).toBe(true);
  });

  // Test 9: Get Like Status for Comment
  it("should return correct like status for a comment", async () => {
    const commentLikeData = {
      cID: testUserId.toString(),
      forumID: "test_comment_456",
      isPost: false
    };

    // Check initial status (should be unliked)
    let res = await request(app)
      .get("/api/like/status")
      .query({
        cID: testUserId.toString(),
        forumID: "test_comment_456",
        isPost: "false"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.liked).toBe(false);

    // Like the comment
    await request(app)
      .post("/api/like/toggle")
      .send(commentLikeData);

    // Check status again (should be liked)
    res = await request(app)
      .get("/api/like/status")
      .query({
        cID: testUserId.toString(),
        forumID: "test_comment_456",
        isPost: "false"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.liked).toBe(true);
  });

  // Test 10: Missing Query Parameters for Status
  it("should fail status check with missing query parameters", async () => {
    const res = await request(app)
      .get("/api/like/status")
      .query({
        cID: testUserId.toString(),
        forumID: testPostId
        // isPost is missing
      });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("message");
  });

  // Test 11: Error Handling
  it("should handle API errors gracefully", async () => {
    // Test with malformed request
    const res = await request(app)
      .post("/api/like/toggle")
      .send("invalid json");

    // Should return an error response
    expect([400, 500]).toContain(res.statusCode);
  });

  // Test 12: Like Count Consistency
  it("should maintain consistent like count across multiple operations", async () => {
    const likeData = {
      cID: testUserId.toString(),
      forumID: testPostId,
      isPost: true
    };

    // Reset post likes to 0
    await Post.findOneAndUpdate({ pID: testPostId }, { likes: 0 });

    // Like the post
    await request(app)
      .post("/api/like/toggle")
      .send(likeData);

    // Verify like count is 1
    let post = await Post.findOne({ pID: testPostId });
    expect(post.likes).toBe(1);

    // Unlike the post
    await request(app)
      .post("/api/like/toggle")
      .send(likeData);

    // Verify like count is 0
    post = await Post.findOne({ pID: testPostId });
    expect(post.likes).toBe(0);

    // Like again
    await request(app)
      .post("/api/like/toggle")
      .send(likeData);

    // Verify like count is 1
    post = await Post.findOne({ pID: testPostId });
    expect(post.likes).toBe(1);
  });
});
