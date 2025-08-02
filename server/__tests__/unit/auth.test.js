const { registerUser, loginUser, getUserProfile, updateProfile, deleteAccount } = require("../../controllers/auth");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

jest.mock("../../models/User");
jest.mock("jsonwebtoken");
jest.mock("bcrypt");

describe("Auth Controller Unit Tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });
    {/* registerUser unit tests*/}
    it("registerUser: should throw error if email is missing", async () => {
    await expect(
        registerUser({ email: "", password: "pass", name: "Test" })
    ).rejects.toThrow("All fields are required");
    });

    it("registerUser: should throw error if password is missing", async () => {
    await expect(
        registerUser({ email: "test@example.com", password: "", name: "Test" })
    ).rejects.toThrow("All fields are required");
    });

    it("registerUser: should throw error if name is missing", async () => {
    await expect(
        registerUser({ email: "test@example.com", password: "pass", name: "" })
    ).rejects.toThrow("All fields are required");
    });
  
    it("registerUser: should throw error if email format is invalid", async () => {
        await expect(
        registerUser({
            email: "existingexample",
            password: "pass",
            name: "Test",
        })
        ).rejects.toThrow("Invalid email format");
    });

    it("registerUser: should throw error if email exists", async () => {
        User.findOne.mockResolvedValue({ email: "existing@example.com" }); //mock that email is found

        await expect(
        registerUser({
            email: "existing@example.com",
            password: "pass",
            name: "Test",
        })
        ).rejects.toThrow("Email already in use");
    });

    it("registerUser: should register new user and return token", async () => {
        const mockUser = {
        cID: "mockCID",
        name: "Test User",
        language: "English",
        save: jest.fn(),
        };

        User.findOne.mockResolvedValue(null);
        User.mockImplementation(() => mockUser); // mock that new user is created
        jwt.sign.mockReturnValue("mockToken"); // with correct token

        const result = await registerUser({
        email: "test@example.com",
        password: "pass",
        name: "Test User",
        });

        expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
        expect(mockUser.save).toHaveBeenCalled();
        expect(result).toEqual({
        token: "mockToken",
        cID: "mockCID",
        isOnboarded: true,
        });
    });

     {/* loginUser unit tests*/}
    it("loginUser: should throw error if email is missing", async () => {
        await expect(
            loginUser({ email: "", password: "pass" })
        ).rejects.toThrow("All fields are required");
    });

    it("loginUser: should throw error if password is missing", async () => {
        await expect(
            loginUser({ email: "test@example.com", password: "" })
        ).rejects.toThrow("All fields are required");
    });
    
    it("loginUser: should throw error if user is not found in database", async () => {
        User.findOne.mockResolvedValue(null);   //mock that user is not found 
    await expect(       
        loginUser({ email: "test@example.com", password: "123" })
    ).rejects.toThrow("User not found");
    });


    it("loginUser: should return token on correct credentials", async () => {
        const mockUser = {
            cID: "mockCID",
            name: "Test User",
            language: "English",
            password: "hashedPass",
        };

        User.findOne.mockResolvedValue(mockUser); // mock user found
        bcrypt.compare.mockResolvedValue(true); // pass is valid
        jwt.sign.mockReturnValue("mockToken"); // toklen is valid

        const result = await loginUser({
        email: "test@example.com",
        password: "pass",
        });

        expect(result).toEqual({
        token: "mockToken",
        cID: "mockCID",
        isOnboarded: true,
        });
    });

    it("loginUser: should throw error on wrong password", async () => {
        User.findOne.mockResolvedValue({ password: "hashed", name: "Test", language: "EN" });
        bcrypt.compare.mockResolvedValue(false); //nmock that password is wrong

        await expect(
        loginUser({ email: "test@example.com", password: "wrong" })
        ).rejects.toThrow("Invalid credentials");
    });

    {/* getUserProfile unit tests*/}
    // tbh, same logic as loginUser for user not found :<
    it("getUserProfile: should throw error if user is not found in database", async () => {
        
        User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
    });
        await expect(getUserProfile("mockCID")).rejects.toThrow("User not found");
    });

    it("getUserProfile: should find user", async () => {
        const mockUser = {
            cID: "mockCID",
            name: "Test User",
            language: "English",
            password: "hashedPass",
        };
        User.findOne.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser),
        });   //mock that user is foound, need to add .select cause it's a chain and need to mock that chain if not they agnry at me and i d-wahfioesafhioafhseo
        const result = await getUserProfile("mockCID");
        expect(User.findOne).toHaveBeenCalledWith({ cID: "mockCID" });
        expect(result).toEqual(mockUser);
    });

    {/* updateProfile unit tests*/}

    it("updateProfile: should throw error if user is not found in database", async () => {
        User.findOneAndUpdate.mockReturnValue({
            select: jest.fn().mockResolvedValue(null),
        });

    await expect(
            updateProfile("mockCID", {
      language: "mockLang",
      name: "mockName",
      profileImg: "mockImg",
    })
        ).rejects.toThrow("User not found");
    });

    it("updateProfile: should update user's new preference", async () => {
        
        User.findOneAndUpdate.mockReturnValue({
            select: jest.fn().mockResolvedValue("mockUser"),
        });

        const result = await updateProfile("mockCID", {
            language: "mockLang",
            name: "mockName",
            profileImg: "mockImg",
        });

        expect(User.findOneAndUpdate).toHaveBeenCalledWith(
            { cID: "mockCID" },
            { $set: { language: "mockLang", name: "mockName", profileImg: "mockImg" } },
            { new: true } // check if mocked function was called with the arguments we need 😔
        );
        expect(result).toBe("mockUser");
    });

    {/* deleteAccount unit tests*/}

    it("deleteAccount: should throw error if user not found in database", async () => {
        User.deleteOne.mockResolvedValue({ deletedCount: 0 });

        await expect(deleteAccount("mockCID")).rejects.toThrow("User not found");
    });

    it("deleteAccount: should delete account when user is found", async () => {
        User.deleteOne.mockResolvedValue({ deletedCount: 1 });

        await expect(deleteAccount("mockCID")).resolves.toBeUndefined();
    });

});
