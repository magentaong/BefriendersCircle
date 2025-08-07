require("dotenv").config();
const request = require("supertest");
const app = require("../../index");
const mongoose = require("mongoose");
const ResourceChat = require("../../models/ResourceChat");

jest.setTimeout(20000);

describe("ResourceChat API", () => {
    const testResourceChat = { title: "Test Resource", description: "Blahblah",
};

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);
    });

    afterEach(async () => {
        await ResourceChat.deleteMany({ title: /Test Resource/i });
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    // return resources
    it("GET /api/resourceChat should return chatbot resources and categories", async () => {
        await ResourceChat.create(testResourceChat);

        const res = await request(app).get("/api/resourceChat");

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("resources");
        expect(res.body).toHaveProperty("categories");
        expect(Array.isArray(res.body.resources)).toBe(true);
        expect(Array.isArray(res.body.categories)).toBe(true);
        expect(res.body.categories).toContain("General");
    });

    // create resource
    it("POST /api/resourceChat should create a chatbot resource", async () => {
        const res = await request(app)
            .post("/api/resourceChat")
            .send(testResourceChat);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("title", "Test Resource");
    });
    
    // missing title = no go
    it("POST /api/resourceChat should fail with missing title", async () => {
        const res = await request(app)
            .post("/api/resourceChat")
            .send({ ...testResourceChat, title: "" });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Failed to create chatbot resource.");
    });

    // no content = no go
    it("POST /api/resourceChat should fail with no content", async () => {
        const res = await request(app)
            .post("/api/resourceChat")
            .send({ title: "Test Chat Resource", description: "", eligibility: [], steps: [] });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Failed to create chatbot resource.");
    });

    // duplicate title = bad
    it("POST /api/resourceChat should fail with duplicate title", async () => {
        const firstRes = await request(app)
            .post("/api/resourceChat")
            .send(testResourceChat);

        expect(firstRes.statusCode).toBe(201);

        // create the same resource again, this time should expect error
        const secondRes = await request(app)
            .post("/api/resourceChat")
            .send(testResourceChat);

        expect(secondRes.statusCode).toBe(400);
        expect(secondRes.body.message).toBe("Failed to create chatbot resource.");
    });

    // should delete
    it("DELETE /api/resourceChat should delete all chatbot resources", async () => {
        await ResourceChat.create(testResourceChat);

        const res = await request(app).delete("/api/resourceChat");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: "All chatbot resources deleted." });

        const remaining = await ResourceChat.find({});
        expect(remaining.length).toBe(0);
    });
});
