require("dotenv").config();
const request = require("supertest");
const app = require("../../index");
const mongoose = require("mongoose");
const Resource = require("../../models/Resource");
const User = require("../../models/User");

jest.setTimeout(20000);

describe("Resource API", () => {
    const testEmail = "test@example.com";
    const testPassword = "123";
    let token;
    const testResourceData = {
        title: "test",
        category: "General",
        url: "https://example.com"
    };

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
    });

    afterEach(async () => {
        await Resource.deleteMany({ title: "Test" });
    });

    afterAll(async () => {
        await User.deleteOne({ email: testEmail });
        await mongoose.disconnect();
    });

    it("GET /api/resources should return all resources", async () => {
        await Resource.create(testResourceData);

        const res = await request(app)
        .get("/api/resources")
        .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty("title");
    });

    it("POST /api/resources should create a resource", async () => {
        const res = await request(app)
        .post("/api/resources")
        .set("Authorization", `Bearer ${token}`)
        .send(testResourceData);

        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe("test");
    });

    it("POST /api/resources should throw an error if resource data (title) is incomplete", async () => {
        const res = await request(app)
        .post("/api/resources")
        .set("Authorization", `Bearer ${token}`)
        .send({title: ""});

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Failed to create resource.");
    });

    it("POST /api/resources should throw an error if resource data (category) is incomplete", async () => {
        const res = await request(app)
        .post("/api/resources")
        .set("Authorization", `Bearer ${token}`)
        .send({title: "I want to kms", category:""});

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Failed to create resource.");
    });

    it("POST /api/resources should throw an error if resource data (link) is incomplete", async () => {
        const res = await request(app)
        .post("/api/resources")
        .set("Authorization", `Bearer ${token}`)
        .send({title: "I want to kms", category:"General", url:""});

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Failed to create resource.");
    });

    
    it("GET /api/resources/categories should return categories", async () => {
        await Resource.create(testResourceData);

        const res = await request(app)
        .get("/api/resources/categories")
        .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toContain("General");
    });

    
    it("GET /api/resources/reload should return resources and categories (auth required)", async () => {
        await Resource.create(testResourceData);

        const res = await request(app)
        .get("/api/resources/reload")
        .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("resources");
        expect(res.body).toHaveProperty("categories");
        expect(Array.isArray(res.body.resources)).toBe(true);
        expect(Array.isArray(res.body.categories)).toBe(true);
    });
});
