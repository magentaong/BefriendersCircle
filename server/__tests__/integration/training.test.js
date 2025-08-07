require("dotenv").config();
const request = require("supertest");
const app = require("../../index");
const mongoose = require("mongoose");
const Training = require("../../models/Training");
const User = require("../../models/User");

jest.setTimeout(20000);

describe("Training API", () => {
    const testEmail = "train_test@example.com";
    const testPassword = "123";
    const trainingTitle = "Home Safety Simulation";

    let token;
    let cID;
    let tID;

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
        tID = `${cID}-home-safety`;
    });

    afterEach(async () => {
        await Training.deleteMany({ cID });
    });

    afterAll(async () => {
        await User.deleteOne({ email: testEmail });
        await mongoose.disconnect();
    });

    it("POST /api/training should create a new training entry", async () => {
        const res = await request(app)
            .post("/api/training")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: trainingTitle, tID, cID });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("tID", tID);
    });

    it("POST /api/training should return existing training if duplicate", async () => {
        await request(app)
            .post("/api/training")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: trainingTitle, tID, cID });

        const res = await request(app)
            .post("/api/training")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: trainingTitle, tID, cID });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Training already exists");
    });

    it("GET /api/training should fetch training by cID and title", async () => {
        await request(app)
            .post("/api/training")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: trainingTitle, tID, cID });

        const res = await request(app)
            .get("/api/training")
            .set("Authorization", `Bearer ${token}`)
            .query({ cID, title: trainingTitle });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("title", trainingTitle);
    });

    it("GET /api/training should fail with missing query params", async () => {
        const res = await request(app)
            .get("/api/training")
            .set("Authorization", `Bearer ${token}`)
            .query({ cID });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Missing cID or title query parameters.");
    });

    it("PATCH /api/training/:tID should update training progress and status", async () => {
        await request(app)
            .post("/api/training")
            .set("Authorization", `Bearer ${token}`)
            .send({ title: trainingTitle, tID, cID });

        const res = await request(app)
            .patch(`/api/training/${tID}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ status: true, progress: 100 });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("progress", 100);
        expect(res.body).toHaveProperty("status", true);
    });

    it("PATCH /api/training/:tID should fail for invalid tID", async () => {
        const res = await request(app)
            .patch("/api/training/nonexistent")
            .set("Authorization", `Bearer ${token}`)
            .send({ status: true });

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Training not found.");
    });
});
