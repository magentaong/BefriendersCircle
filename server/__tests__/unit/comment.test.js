const { getComments, createComment, getCommentFromPost } = require("../../controllers/comment");
const Comment = require("../../models/Comment");

jest.mock("../../models/Comment");

describe("Comment Controller Unit Tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test Scenario: Fetch comments by post
    describe("getCommentFromPost", () => {
        it("should retrieve all comments for a given post ID successfully", async () => {
            const mockComments = [
                { 
                    commID: "comm_123", 
                    pID: "post_456", 
                    cID: "user_1", 
                    message: "Great post!", 
                    likes: 5 
                },
                { 
                    commID: "comm_789", 
                    pID: "post_456", 
                    cID: "user_2", 
                    message: "Thanks for sharing", 
                    likes: 2 
                }
            ];

            Comment.find.mockResolvedValue(mockComments);

            const result = await getCommentFromPost(Comment, "post_456");

            expect(Comment.find).toHaveBeenCalledWith({ pID: "post_456" });
            expect(result).toEqual(mockComments);
        });

        it("should return empty array when no comments found for post", async () => {
            Comment.find.mockResolvedValue([]);

            const result = await getCommentFromPost(Comment, "post_nonexistent");

            expect(Comment.find).toHaveBeenCalledWith({ pID: "post_nonexistent" });
            expect(result).toEqual([]);
        });

        it("should throw error when database operation fails", async () => {
            Comment.find.mockRejectedValue(new Error("Database error"));

            await expect(getCommentFromPost(Comment, "post_456")).rejects.toThrow("Failed to fetch board");
        });

        it("should handle invalid post ID format", async () => {
            const invalidPostId = "";
            Comment.find.mockResolvedValue([]);

            const result = await getCommentFromPost(Comment, invalidPostId);

            expect(Comment.find).toHaveBeenCalledWith({ pID: invalidPostId });
            expect(result).toEqual([]);
        });

        it("should handle malformed post ID", async () => {
            const malformedPostId = "invalid_format_123";
            Comment.find.mockResolvedValue([]);

            const result = await getCommentFromPost(Comment, malformedPostId);

            expect(Comment.find).toHaveBeenCalledWith({ pID: malformedPostId });
            expect(result).toEqual([]);
        });

        it("should handle null post ID", async () => {
            const nullPostId = null;
            Comment.find.mockResolvedValue([]);

            const result = await getCommentFromPost(Comment, nullPostId);

            expect(Comment.find).toHaveBeenCalledWith({ pID: nullPostId });
            expect(result).toEqual([]);
        });
    });

    // Test Scenario: Add comment
    describe("createComment", () => {
        it("should create a new comment successfully", async () => {
            const commentData = {
                pID: "post_456",
                cID: "user_123",
                message: "This is a great post!",
                likes: 0
            };

            const mockSavedComment = {
                commID: "comm_999",
                pID: "post_456",
                cID: "user_123",
                message: "This is a great post!",
                likes: 0,
                save: jest.fn().mockResolvedValue(undefined)
            };

            Comment.mockImplementation(() => mockSavedComment);

            const result = await createComment(Comment, commentData);

            expect(Comment).toHaveBeenCalledWith(commentData);
            expect(mockSavedComment.save).toHaveBeenCalled();
            expect(result).toEqual(mockSavedComment);
        });

        it("should create comment with auto-generated commID", async () => {
            const commentData = {
                pID: "post_456",
                cID: "user_123",
                message: "Another comment"
            };

            const mockSavedComment = {
                commID: "comm_auto123",
                ...commentData,
                save: jest.fn().mockResolvedValue({
                    commID: "comm_auto123",
                    ...commentData
                })
            };

            Comment.mockImplementation(() => mockSavedComment);

            const result = await createComment(Comment, commentData);

            expect(result.commID).toBe("comm_auto123");
        });

        it("should throw error when required fields are missing", async () => {
            const commentData = {
                pID: "post_456",
            };

            const mockComment = {
                save: jest.fn().mockRejectedValue(new Error("Validation failed"))
            };

            Comment.mockImplementation(() => mockComment);

            await expect(createComment(Comment, commentData)).rejects.toThrow("Failed to fetch comment");
        });

        it("should throw error when save operation fails", async () => {
            const commentData = {
                pID: "post_456",
                cID: "user_123",
                message: "Test comment"
            };

            const mockComment = {
                save: jest.fn().mockRejectedValue(new Error("Database save failed"))
            };

            Comment.mockImplementation(() => mockComment);

            await expect(createComment(Comment, commentData)).rejects.toThrow("Failed to fetch comment");
        });

        it("should handle empty message", async () => {
            const commentData = {
                pID: "post_456",
                cID: "user_123",
                message: ""
            };

            const mockComment = {
                save: jest.fn().mockRejectedValue(new Error("Message is required"))
            };

            Comment.mockImplementation(() => mockComment);

            await expect(createComment(Comment, commentData)).rejects.toThrow("Failed to fetch comment");
        });
    });

    // Test Scenario: Fetch all comments
    describe("getComments", () => {
        it("should retrieve all comments successfully", async () => {
            const mockComments = [
                { 
                    commID: "comm_123", 
                    pID: "post_1", 
                    cID: "user_1", 
                    message: "Comment 1", 
                    likes: 3 
                },
                { 
                    commID: "comm_456", 
                    pID: "post_2", 
                    cID: "user_2", 
                    message: "Comment 2", 
                    likes: 1 
                }
            ];

            Comment.find.mockResolvedValue(mockComments);

            const result = await getComments(Comment);

            expect(Comment.find).toHaveBeenCalledWith();
            expect(result).toEqual(mockComments);
        });

        it("should throw error when database operation fails", async () => {
            Comment.find.mockRejectedValue(new Error("Database error"));

            await expect(getComments(Comment)).rejects.toThrow("Failed to fetch comment");
        });

        it("should return empty array when no comments exist", async () => {
            Comment.find.mockResolvedValue([]);

            const result = await getComments(Comment);

            expect(result).toEqual([]);
        });
    });

    // Additional edge cases and error handling
    describe("Edge Cases and Error Handling", () => {
        it("should handle very long comment messages", async () => {
            const longMessage = "A".repeat(1000);
            const commentData = {
                pID: "post_456",
                cID: "user_123",
                message: longMessage
            };

            const mockSavedComment = {
                commID: "comm_long",
                ...commentData,
                save: jest.fn().mockResolvedValue({
                    commID: "comm_long",
                    ...commentData
                })
            };

            Comment.mockImplementation(() => mockSavedComment);

            const result = await createComment(Comment, commentData);

            expect(result.message).toBe(longMessage);
        });

        it("should handle special characters in comment messages", async () => {
            const specialMessage = "Comment with special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?";
            const commentData = {
                pID: "post_456",
                cID: "user_123",
                message: specialMessage
            };

            const mockSavedComment = {
                commID: "comm_special",
                ...commentData,
                save: jest.fn().mockResolvedValue({
                    commID: "comm_special",
                    ...commentData
                })
            };

            Comment.mockImplementation(() => mockSavedComment);

            const result = await createComment(Comment, commentData);

            expect(result.message).toBe(specialMessage);
        });

        it("should handle comments with emojis", async () => {
            const emojiMessage = "Great post! 👍 😊 🎉";
            const commentData = {
                pID: "post_456",
                cID: "user_123",
                message: emojiMessage
            };

            const mockSavedComment = {
                commID: "comm_emoji",
                ...commentData,
                save: jest.fn().mockResolvedValue({
                    commID: "comm_emoji",
                    ...commentData
                })
            };

            Comment.mockImplementation(() => mockSavedComment);

            const result = await createComment(Comment, commentData);

            expect(result.message).toBe(emojiMessage);
        });

        it("should handle invalid post ID format for comment creation", async () => {
            const commentData = {
                pID: "", // Invalid empty post ID
                cID: "user_123",
                message: "Test comment"
            };

            const mockComment = {
                save: jest.fn().mockRejectedValue(new Error("Invalid post ID"))
            };

            Comment.mockImplementation(() => mockComment);

            await expect(createComment(Comment, commentData)).rejects.toThrow("Failed to fetch comment");
        });

        it("should handle multiple comments on same post", async () => {
            const postId = "post_456";
            const mockComments = [
                { commID: "comm_1", pID: postId, cID: "user_1", message: "First comment", likes: 2 },
                { commID: "comm_2", pID: postId, cID: "user_2", message: "Second comment", likes: 1 },
                { commID: "comm_3", pID: postId, cID: "user_3", message: "Third comment", likes: 0 }
            ];

            Comment.find.mockResolvedValue(mockComments);

            const result = await getCommentFromPost(Comment, postId);

            expect(Comment.find).toHaveBeenCalledWith({ pID: postId });
            expect(result).toHaveLength(3);
            expect(result).toEqual(mockComments);
        });
    });
});

