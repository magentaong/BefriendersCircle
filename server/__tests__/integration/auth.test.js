require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../index");
const User = require("../../models/User");

jest.setTimeout(10000);

beforeEach(async () => {
  await User.deleteOne({ email: "testuser@example.com" });
  await User.deleteOne({ email: "testuser1@example.com" }); 
  await User.deleteOne({ email: "testuser2@example.com" });//need delete cause if not test cases would always fail :<
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Auth API", () => {
    // Successful registration 
  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "testuser@example.com",
      password: "StrongPassword123",
      name: "Test User"
    });

    expect(res.statusCode).toBe(201); // error code for request fulfilled
    expect(res.body.token).toBeDefined();
  });
    // Sign up with existing email
  it("should show error registration with existing email", async () => {
    await User.create({
      email: "testuser@example.com",
      password: "StrongPassword123",
      name: "Test User"
    });

    const res = await request(app).post("/api/auth/register").send({
      email: "testuser@example.com",
      password: "StrongPassword123",
      name: "Test User"
    });

    expect(res.statusCode).toBe(400); //error code for bad request
  });
    // Login successfully
  it("should login successfully", async () => {
    await request(app).post("/api/auth/register").send({
      email: "testuser@example.com",
      password: "StrongPassword123",
      name: "Test User"
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "StrongPassword123"
    });

    expect(res.statusCode).toBe(200); // error code for OK
    expect(res.body.token).toBeDefined();
  });
    // Incorrect password
  it("should fail login with wrong password", async () => {
    await request(app).post("/api/auth/register").send({
      email: "testuser@example.com",
      password: "StrongPassword123",
      name: "Test User"
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "WrongPassword"
    });

    expect(res.statusCode).toBe(401);
  });
  // Fail with invalid email address
  it("should fail registration with invalid email address", async () => {
    await request(app).post("/api/auth/register").send({
      email: "testuserexample.com",
      password: "StrongPassword123",
      name: "Test User"
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "testuserexample.com",
      password: "WrongPassword"
    });

    expect(res.statusCode).toBe(401); // unauthorised
  });

  // Fail with missing required fields (password missing)
  it("should fail registration with missing password field", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "testuser@example.com",
      password: "",
      name: "Test User"
    });

    expect(res.statusCode).toBe(400); //400 for no
  });

    // Fail with missing required fields (email missing)
  it("should fail registration with missing email field", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "",
      password: "StrongPassword123",
      name: "Test User"
    });

    expect(res.statusCode).toBe(400); 
  });
   // Fail with missing required fields (name missing)
  it("should fail registration with missing name field", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "testuser@example.com",
      password: "StrongPassword123",
      name: ""
    });

    expect(res.statusCode).toBe(400); 
  });

  // test with incorrect email (email typed wrong or something like that)
  it("should fail login due to incorrect email", async () => {
    await request(app).post("/api/auth/register").send({
      email: "testuser1@example.com",
      password: "StrongPassword123",
      name: "Test User"
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "testuser2@example.com",
      password: "StrongPassword"
    });

    expect(res.statusCode).toBe(404); //cause user not found so 404
  });
});

