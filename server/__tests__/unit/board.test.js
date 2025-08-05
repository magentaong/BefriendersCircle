const { retrieveBoards, createBoard, getBoardsByCategory } = require("../../controllers/board");
const Board = require("../../models/Board");

jest.mock("../../models/Board");

describe("Board Controller Unit Tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test Scenario: Fetch all boards
    describe("retrieveBoards", () => {
        it("should retrieve all boards successfully", async () => {
            const mockBoards = [
                { bID: "board_123", cID: "user_1", category: "General", name: "Test Board 1" },
                { bID: "board_456", cID: "user_2", category: "Support", name: "Test Board 2" }
            ];

            Board.find.mockResolvedValue(mockBoards);

            const result = await retrieveBoards(Board);

            expect(Board.find).toHaveBeenCalledWith();
            expect(result).toEqual(mockBoards);
        });

        it("should throw error when no boards are found", async () => {
            Board.find.mockResolvedValue(null);

            await expect(retrieveBoards(Board)).rejects.toThrow("Failed to fetch boards");
        });

        it("should throw error when database operation fails", async () => {
            Board.find.mockRejectedValue(new Error("Database error"));

            await expect(retrieveBoards(Board)).rejects.toThrow("Database error");
        });
    });

    // Test Scenario: Fetch boards by category
    describe("getBoardsByCategory", () => {
        it("should retrieve boards by category successfully", async () => {
            const mockBoards = [
                { bID: "board_123", cID: "user_1", category: "General", name: "Test Board 1" },
                { bID: "board_456", cID: "user_2", category: "General", name: "Test Board 2" }
            ];

            Board.find.mockResolvedValue(mockBoards);

            const result = await getBoardsByCategory(Board, "General");

            expect(Board.find).toHaveBeenCalledWith({ category: "General" });
            expect(result).toEqual(mockBoards);
        });

        it("should return empty array when no boards found for category", async () => {
            Board.find.mockResolvedValue([]);

            const result = await getBoardsByCategory(Board, "NonExistentCategory");

            expect(Board.find).toHaveBeenCalledWith({ category: "NonExistentCategory" });
            expect(result).toEqual([]);
        });

        it("should throw error when database operation fails", async () => {
            Board.find.mockRejectedValue(new Error("Database error"));

            await expect(getBoardsByCategory(Board, "General")).rejects.toThrow("Database error");
        });
    });

    // Test Scenario: Create board
    describe("createBoard", () => {
        it("should create a new board successfully", async () => {
            const boardData = {
                cID: "user_123",
                category: "Support",
                name: "New Test Board",
                coverImg: "image_url.jpg"
            };

            const mockSavedBoard = {
                bID: "board_789",
                ...boardData,
                save: jest.fn().mockResolvedValue({
                    bID: "board_789",
                    ...boardData
                })
            };

            Board.mockImplementation(() => mockSavedBoard);

            const result = await createBoard(Board, boardData);

            expect(Board).toHaveBeenCalledWith(boardData);
            expect(mockSavedBoard.save).toHaveBeenCalled();
            expect(result).toEqual({
                bID: "board_789",
                ...boardData
            });
        });

        it("should create board without coverImg", async () => {
            const boardData = {
                cID: "user_123",
                category: "General",
                name: "Board without image"
            };

            const mockSavedBoard = {
                bID: "board_999",
                ...boardData,
                save: jest.fn().mockResolvedValue({
                    bID: "board_999",
                    ...boardData
                })
            };

            Board.mockImplementation(() => mockSavedBoard);

            const result = await createBoard(Board, boardData);

            expect(Board).toHaveBeenCalledWith(boardData);
            expect(mockSavedBoard.save).toHaveBeenCalled();
            expect(result).toEqual({
                bID: "board_999",
                ...boardData
            });
        });

        it("should throw error when required fields are missing", async () => {
            const boardData = {
                cID: "user_123",
            };

            const mockBoard = {
                save: jest.fn().mockRejectedValue(new Error("Validation failed"))
            };

            Board.mockImplementation(() => mockBoard);

            await expect(createBoard(Board, boardData)).rejects.toThrow("Validation failed");
        });

        it("should throw error when save operation fails", async () => {
            const boardData = {
                cID: "user_123",
                category: "Support",
                name: "Test Board"
            };

            const mockBoard = {
                save: jest.fn().mockRejectedValue(new Error("Database save failed"))
            };

            Board.mockImplementation(() => mockBoard);

            await expect(createBoard(Board, boardData)).rejects.toThrow("Database save failed");
        });
    });

    // Additional edge cases and error handling
    describe("Edge Cases and Error Handling", () => {
        it("should handle empty board data gracefully", async () => {
            const boardData = {};

            const mockBoard = {
                save: jest.fn().mockRejectedValue(new Error("Validation failed"))
            };

            Board.mockImplementation(() => mockBoard);

            await expect(createBoard(Board, boardData)).rejects.toThrow("Validation failed");
        });

        it("should handle special characters in board name", async () => {
            const boardData = {
                cID: "user_123",
                category: "Support",
                name: "Board with special chars: !@#$%^&*()",
                coverImg: "image.jpg"
            };

            const mockSavedBoard = {
                bID: "board_special",
                ...boardData,
                save: jest.fn().mockResolvedValue({
                    bID: "board_special",
                    ...boardData
                })
            };

            Board.mockImplementation(() => mockSavedBoard);

            const result = await createBoard(Board, boardData);

            expect(result.name).toBe("Board with special chars: !@#$%^&*()");
        });

        it("should handle long category names", async () => {
            const longCategory = "A".repeat(100);
            const mockBoards = [
                { bID: "board_123", cID: "user_1", category: longCategory, name: "Test Board" }
            ];

            Board.find.mockResolvedValue(mockBoards);

            const result = await getBoardsByCategory(Board, longCategory);

            expect(Board.find).toHaveBeenCalledWith({ category: longCategory });
            expect(result).toEqual(mockBoards);
        });
    });
});

