require("dotenv").config();
const request = require("supertest");
const app = require("../../index");
const mongoose = require("mongoose");
const Post = require("../../models/Post");
const Board = require("../../models/Board");
const Comment = require("../../models/Comment");
const User = require("../../models/User"); // Assuming your model is called "User.js"


jest.setTimeout(20000);

describe("Post API", () => {
    let testBoard;
    let testPost;
    let token;
    let cID;
    const testEmail = "testing123@gmail.com";
    const testPassword = "123";
    const [fakeBoard, fakePost] = ["fake" , "scam"]

    //before each test, register and uesr and login so you get a token.
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);

        await request(app).post("/api/auth/register").send({
            name: "Test",
            email: testEmail,
            password: testPassword,
            confirmPassword: testPassword,
        });

        const loginRes = await request(app).post("/api/auth/login").send({
            email: testEmail,
            password: testPassword,
        });

        token = loginRes.body.token;
        cID = loginRes.body.cID;
    });

    beforeEach(async () => {
        testBoard = await Board.create({ 
            bID: "board_123", 
            name: "Test Board", 
            cID: cID, 
            category: "General"
        });

        testPost = await Post.create({ 
            bID: testBoard.bID, 
            cID: cID, 
            message: "Test"
        });
    });

    afterEach(async () => {
        if (testPost) await Post.deleteOne({ pID: testPost.pID });
        if (testBoard) await Board.deleteOne({ bID: testBoard.bID });
        await Comment.deleteMany({ pID: testPost?.pID }); // delete all the comments (if any) with testPost's pID  
    });

    afterAll(async () => {
        await User.deleteOne({ email: testEmail }); // Clean up test user
        await mongoose.disconnect();
    });

    it("GET /api/post should return posts when authorised", async () => {
        const res = await request(app)
        .get("/api/post")
        .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("GET /api/post should throw error when not logged in", async () => {
        const res = await request(app)
        .get("/api/post")
    
        expect(res.statusCode).toBe(401);
    });

    it("POST /api/post should create a post when authorised", async () => {
        const res = await request(app)
        .post("/api/post")
        .set("Authorization", `Bearer ${token}`)
        .send({ bID: testBoard.bID, cID: cID, message: "New post" });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe("New post");
    });

    it("POST /api/post should throw an error when not logged in", async () => {
        const res = await request(app)
        .post("/api/post")
        .send({ bID: testBoard.bID, cID: cID, message: "New post" });

        expect(res.statusCode).toBe(401);
    });

    it("GET /api/post/details/:postId should return post details", async () => {
        const res = await request(app)
        .get(`/api/post/details/${testPost.pID}`)
        .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.post.pID).toBe(testPost.pID);
    });

    it("GET /api/post/details/:postId should throw error when not authorised", async () => {
        const res = await request(app)
        .get(`/api/post/details/${testPost.pID}`)

        expect(res.statusCode).toBe(401);
    });

    it("GET /api/post/details/:postId should throw error when Post not found", async () => {
        const res = await request(app)
        .get(`/api/post/details/${fakePost.pID}`)
        .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Post not found");
    });

    it("DELETE /api/post/details/:postId should delete post and comments", async () => {
        const res = await request(app)
        .delete(`/api/post/details/${testPost.pID}`)
        .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Post and associated comments deleted");
    });

    it("DELETE /api/post/details/:postId should throw error when not authorised", async () => {
        const res = await request(app)
        .delete(`/api/post/details/${testPost.pID}`)

        expect(res.statusCode).toBe(401);
    });

    it("GET /api/post/:name should return posts for a board", async () => {
        const res = await request(app)
        .get(`/api/post/${testBoard.name}`)
        .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.bID).toBe(testBoard.bID);
    });

    it("GET /api/post/:name should throw error when board not found", async () => {
        const res = await request(app)
        .get(`/api/post/${fakeBoard}`)
        .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Board not found");
    });
});
