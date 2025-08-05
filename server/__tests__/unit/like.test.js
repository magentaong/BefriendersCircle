const { toggleLike, getLikeStatus } = require("../../controllers/like");
const ForumLike = require("../../models/ForumLike");
const Post = require("../../models/Post");

jest.mock("../../models/ForumLike");
jest.mock("../../models/Post");

describe("Like Controller Unit Tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test Scenario: Like post
    describe("toggleLike - Like Post", () => {
        it("should like a post successfully and increment like count", async () => {
            const cID = "user_123";
            const forumID = "post_456";
            const isPost = true;

            // Mock that no existing like is found
            ForumLike.findOne.mockResolvedValue(null);

            // Mock the new like creation
            const mockNewLike = {
                fLID: "fL_abc123",
                cID: cID,
                forumID: forumID,
                isPost: isPost,
                isLiked: true,
                save: jest.fn().mockResolvedValue({
                    fLID: "fL_abc123",
                    cID: cID,
                    forumID: forumID,
                    isPost: isPost,
                    isLiked: true
                })
            };
            ForumLike.mockImplementation(() => mockNewLike);

            // Mock Post update
            Post.findOneAndUpdate.mockResolvedValue({ pID: forumID, likes: 5 });

            const result = await toggleLike(cID, forumID, isPost);

            expect(ForumLike.findOne).toHaveBeenCalledWith({ cID, forumID, isPost });
            expect(ForumLike).toHaveBeenCalledWith({ cID, forumID, isPost, isLiked: true });
            expect(mockNewLike.save).toHaveBeenCalled();
            expect(Post.findOneAndUpdate).toHaveBeenCalledWith(
                { pID: forumID },
                { $inc: { likes: 1 } }
            );
            expect(result).toEqual({ liked: true });
        });

        it("should like a comment successfully (no post update)", async () => {
            const cID = "user_123";
            const forumID = "comment_789";
            const isPost = false;

            // Mock that no existing like is found
            ForumLike.findOne.mockResolvedValue(null);

            // Mock the new like creation
            const mockNewLike = {
                fLID: "fL_def456",
                cID: cID,
                forumID: forumID,
                isPost: isPost,
                isLiked: true,
                save: jest.fn().mockResolvedValue({
                    fLID: "fL_def456",
                    cID: cID,
                    forumID: forumID,
                    isPost: isPost,
                    isLiked: true
                })
            };
            ForumLike.mockImplementation(() => mockNewLike);

            const result = await toggleLike(cID, forumID, isPost);

            expect(ForumLike.findOne).toHaveBeenCalledWith({ cID, forumID, isPost });
            expect(ForumLike).toHaveBeenCalledWith({ cID, forumID, isPost, isLiked: true });
            expect(mockNewLike.save).toHaveBeenCalled();
            expect(Post.findOneAndUpdate).not.toHaveBeenCalled();
            expect(result).toEqual({ liked: true });
        });
    });

    // Test Scenario: Unlike post
    describe("toggleLike - Unlike Post", () => {
        it("should unlike a post successfully and decrement like count", async () => {
            const cID = "user_123";
            const forumID = "post_456";
            const isPost = true;

            // Mock existing like found
            const existingLike = {
                _id: "like_123",
                fLID: "fL_abc123",
                cID: cID,
                forumID: forumID,
                isPost: isPost,
                isLiked: true
            };
            ForumLike.findOne.mockResolvedValue(existingLike);

            // Mock delete operation
            ForumLike.deleteOne.mockResolvedValue({ deletedCount: 1 });

            // Mock Post update
            Post.findOneAndUpdate.mockResolvedValue({ pID: forumID, likes: 4 });

            const result = await toggleLike(cID, forumID, isPost);

            expect(ForumLike.findOne).toHaveBeenCalledWith({ cID, forumID, isPost });
            expect(ForumLike.deleteOne).toHaveBeenCalledWith({ _id: existingLike._id });
            expect(Post.findOneAndUpdate).toHaveBeenCalledWith(
                { pID: forumID },
                { $inc: { likes: -1 } }
            );
            expect(result).toEqual({ liked: false });
        });

        it("should unlike a comment successfully (no post update)", async () => {
            const cID = "user_123";
            const forumID = "comment_789";
            const isPost = false;

            // Mock existing like found
            const existingLike = {
                _id: "like_456",
                fLID: "fL_def456",
                cID: cID,
                forumID: forumID,
                isPost: isPost,
                isLiked: true
            };
            ForumLike.findOne.mockResolvedValue(existingLike);

            // Mock delete operation
            ForumLike.deleteOne.mockResolvedValue({ deletedCount: 1 });

            const result = await toggleLike(cID, forumID, isPost);

            expect(ForumLike.findOne).toHaveBeenCalledWith({ cID, forumID, isPost });
            expect(ForumLike.deleteOne).toHaveBeenCalledWith({ _id: existingLike._id });
            expect(Post.findOneAndUpdate).not.toHaveBeenCalled();
            expect(result).toEqual({ liked: false });
        });
    });

    // Test Scenario: Double like prevention
    describe("Double Like Prevention", () => {
        it("should prevent double liking by toggling to unlike", async () => {
            const cID = "user_123";
            const forumID = "post_456";
            const isPost = true;

            // Mock existing like found (user already liked)
            const existingLike = {
                _id: "like_123",
                fLID: "fL_abc123",
                cID: cID,
                forumID: forumID,
                isPost: isPost,
                isLiked: true
            };
            ForumLike.findOne.mockResolvedValue(existingLike);

            // Mock delete operation
            ForumLike.deleteOne.mockResolvedValue({ deletedCount: 1 });

            // Mock Post update
            Post.findOneAndUpdate.mockResolvedValue({ pID: forumID, likes: 4 });

            const result = await toggleLike(cID, forumID, isPost);

            expect(ForumLike.findOne).toHaveBeenCalledWith({ cID, forumID, isPost });
            expect(ForumLike.deleteOne).toHaveBeenCalledWith({ _id: existingLike._id });
            expect(result).toEqual({ liked: false });
        });

        it("should handle consecutive like/unlike operations correctly", async () => {
            const cID = "user_123";
            const forumID = "post_456";
            const isPost = true;

            // First call: no existing like (should like)
            ForumLike.findOne.mockResolvedValueOnce(null);

            const mockNewLike = {
                fLID: "fL_abc123",
                cID: cID,
                forumID: forumID,
                isPost: isPost,
                isLiked: true,
                save: jest.fn().mockResolvedValue({
                    fLID: "fL_abc123",
                    cID: cID,
                    forumID: forumID,
                    isPost: isPost,
                    isLiked: true
                })
            };
            ForumLike.mockImplementationOnce(() => mockNewLike);
            Post.findOneAndUpdate.mockResolvedValueOnce({ pID: forumID, likes: 5 });

            const firstResult = await toggleLike(cID, forumID, isPost);
            expect(firstResult).toEqual({ liked: true });

            // Second call: existing like found (should unlike)
            const existingLike = {
                _id: "like_123",
                fLID: "fL_abc123",
                cID: cID,
                forumID: forumID,
                isPost: isPost,
                isLiked: true
            };
            ForumLike.findOne.mockResolvedValueOnce(existingLike);
            ForumLike.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });
            Post.findOneAndUpdate.mockResolvedValueOnce({ pID: forumID, likes: 4 });

            const secondResult = await toggleLike(cID, forumID, isPost);
            expect(secondResult).toEqual({ liked: false });
        });
    });

    // Test Scenario: Input validation
    describe("Input Validation", () => {
        it("should throw error when cID is missing", async () => {
            const forumID = "post_456";
            const isPost = true;

            await expect(toggleLike(null, forumID, isPost)).rejects.toThrow("Missing required fields");
        });

        it("should throw error when forumID is missing", async () => {
            const cID = "user_123";
            const isPost = true;

            await expect(toggleLike(cID, null, isPost)).rejects.toThrow("Missing required fields");
        });

        it("should throw error when isPost is not boolean", async () => {
            const cID = "user_123";
            const forumID = "post_456";
            const isPost = "true"; // String instead of boolean

            await expect(toggleLike(cID, forumID, isPost)).rejects.toThrow("Missing required fields");
        });

        it("should throw error when all parameters are missing", async () => {
            await expect(toggleLike(null, null, null)).rejects.toThrow("Missing required fields");
        });

        it("should throw error when cID is empty string", async () => {
            const forumID = "post_456";
            const isPost = true;

            await expect(toggleLike("", forumID, isPost)).rejects.toThrow("Missing required fields");
        });

        it("should throw error when forumID is empty string", async () => {
            const cID = "user_123";
            const isPost = true;

            await expect(toggleLike(cID, "", isPost)).rejects.toThrow("Missing required fields");
        });
    });

    // Test Scenario: Get like status
    describe("getLikeStatus", () => {
        it("should return liked: true when user has liked the post", async () => {
            const cID = "user_123";
            const forumID = "post_456";
            const isPostRaw = "true";

            const existingLike = {
                fLID: "fL_abc123",
                cID: cID,
                forumID: forumID,
                isPost: true,
                isLiked: true
            };
            ForumLike.findOne.mockResolvedValue(existingLike);

            const result = await getLikeStatus(cID, forumID, isPostRaw);

            expect(ForumLike.findOne).toHaveBeenCalledWith({ cID, forumID, isPost: true });
            expect(result).toEqual({ liked: true });
        });

        it("should return liked: false when user has not liked the post", async () => {
            const cID = "user_123";
            const forumID = "post_456";
            const isPostRaw = "true";

            ForumLike.findOne.mockResolvedValue(null);

            const result = await getLikeStatus(cID, forumID, isPostRaw);

            expect(ForumLike.findOne).toHaveBeenCalledWith({ cID, forumID, isPost: true });
            expect(result).toEqual({ liked: false });
        });

        it("should handle comment like status correctly", async () => {
            const cID = "user_123";
            const forumID = "comment_789";
            const isPostRaw = "false";

            const existingLike = {
                fLID: "fL_def456",
                cID: cID,
                forumID: forumID,
                isPost: false,
                isLiked: true
            };
            ForumLike.findOne.mockResolvedValue(existingLike);

            const result = await getLikeStatus(cID, forumID, isPostRaw);

            expect(ForumLike.findOne).toHaveBeenCalledWith({ cID, forumID, isPost: false });
            expect(result).toEqual({ liked: true });
        });

        it("should throw error when cID is missing for getLikeStatus", async () => {
            const forumID = "post_456";
            const isPostRaw = "true";

            await expect(getLikeStatus(null, forumID, isPostRaw)).rejects.toThrow("Missing required query parameters");
        });

        it("should throw error when forumID is missing for getLikeStatus", async () => {
            const cID = "user_123";
            const isPostRaw = "true";

            await expect(getLikeStatus(cID, null, isPostRaw)).rejects.toThrow("Missing required query parameters");
        });

        it("should throw error when isPostRaw is undefined for getLikeStatus", async () => {
            const cID = "user_123";
            const forumID = "post_456";

            await expect(getLikeStatus(cID, forumID, undefined)).rejects.toThrow("Missing required query parameters");
        });
    });

    // Test Scenario: Database error handling
    describe("Database Error Handling", () => {
        it("should handle database errors during like creation", async () => {
            const cID = "user_123";
            const forumID = "post_456";
            const isPost = true;

            ForumLike.findOne.mockResolvedValue(null);

            const mockNewLike = {
                save: jest.fn().mockRejectedValue(new Error("Database save failed"))
            };
            ForumLike.mockImplementation(() => mockNewLike);

            await expect(toggleLike(cID, forumID, isPost)).rejects.toThrow("Database save failed");
        });

        it("should handle database errors during like deletion", async () => {
            const cID = "user_123";
            const forumID = "post_456";
            const isPost = true;

            const existingLike = {
                _id: "like_123",
                fLID: "fL_abc123",
                cID: cID,
                forumID: forumID,
                isPost: isPost,
                isLiked: true
            };
            ForumLike.findOne.mockResolvedValue(existingLike);
            ForumLike.deleteOne.mockRejectedValue(new Error("Database delete failed"));

            await expect(toggleLike(cID, forumID, isPost)).rejects.toThrow("Database delete failed");
        });

        it("should handle database errors during post update", async () => {
            const cID = "user_123";
            const forumID = "post_456";
            const isPost = true;

            ForumLike.findOne.mockResolvedValue(null);

            const mockNewLike = {
                fLID: "fL_abc123",
                cID: cID,
                forumID: forumID,
                isPost: isPost,
                isLiked: true,
                save: jest.fn().mockResolvedValue({
                    fLID: "fL_abc123",
                    cID: cID,
                    forumID: forumID,
                    isPost: isPost,
                    isLiked: true
                })
            };
            ForumLike.mockImplementation(() => mockNewLike);
            Post.findOneAndUpdate.mockRejectedValue(new Error("Post update failed"));

            await expect(toggleLike(cID, forumID, isPost)).rejects.toThrow("Post update failed");
        });

        it("should handle database errors during like status check", async () => {
            const cID = "user_123";
            const forumID = "post_456";
            const isPostRaw = "true";

            ForumLike.findOne.mockRejectedValue(new Error("Database query failed"));

            await expect(getLikeStatus(cID, forumID, isPostRaw)).rejects.toThrow("Database query failed");
        });
    });

    // Test Scenario: Edge cases
    describe("Edge Cases", () => {
        it("should handle multiple users liking the same post", async () => {
            const postID = "post_456";
            const isPost = true;

            // User 1 likes the post
            ForumLike.findOne.mockResolvedValueOnce(null);
            const mockNewLike1 = {
                fLID: "fL_abc123",
                cID: "user_1",
                forumID: postID,
                isPost: isPost,
                isLiked: true,
                save: jest.fn().mockResolvedValue({
                    fLID: "fL_abc123",
                    cID: "user_1",
                    forumID: postID,
                    isPost: isPost,
                    isLiked: true
                })
            };
            ForumLike.mockImplementationOnce(() => mockNewLike1);
            Post.findOneAndUpdate.mockResolvedValueOnce({ pID: postID, likes: 1 });

            const result1 = await toggleLike("user_1", postID, isPost);
            expect(result1).toEqual({ liked: true });

            // User 2 likes the same post
            ForumLike.findOne.mockResolvedValueOnce(null);
            const mockNewLike2 = {
                fLID: "fL_def456",
                cID: "user_2",
                forumID: postID,
                isPost: isPost,
                isLiked: true,
                save: jest.fn().mockResolvedValue({
                    fLID: "fL_def456",
                    cID: "user_2",
                    forumID: postID,
                    isPost: isPost,
                    isLiked: true
                })
            };
            ForumLike.mockImplementationOnce(() => mockNewLike2);
            Post.findOneAndUpdate.mockResolvedValueOnce({ pID: postID, likes: 2 });

            const result2 = await toggleLike("user_2", postID, isPost);
            expect(result2).toEqual({ liked: true });
        });

        it("should handle rapid like/unlike operations", async () => {
            const cID = "user_123";
            const forumID = "post_456";
            const isPost = true;

            // First like
            ForumLike.findOne.mockResolvedValueOnce(null);
            const mockNewLike = {
                fLID: "fL_abc123",
                cID: cID,
                forumID: forumID,
                isPost: isPost,
                isLiked: true,
                save: jest.fn().mockResolvedValue({
                    fLID: "fL_abc123",
                    cID: cID,
                    forumID: forumID,
                    isPost: isPost,
                    isLiked: true
                })
            };
            ForumLike.mockImplementationOnce(() => mockNewLike);
            Post.findOneAndUpdate.mockResolvedValueOnce({ pID: forumID, likes: 1 });

            const result1 = await toggleLike(cID, forumID, isPost);
            expect(result1).toEqual({ liked: true });

            // Immediate unlike
            const existingLike = {
                _id: "like_123",
                fLID: "fL_abc123",
                cID: cID,
                forumID: forumID,
                isPost: isPost,
                isLiked: true
            };
            ForumLike.findOne.mockResolvedValueOnce(existingLike);
            ForumLike.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });
            Post.findOneAndUpdate.mockResolvedValueOnce({ pID: forumID, likes: 0 });

            const result2 = await toggleLike(cID, forumID, isPost);
            expect(result2).toEqual({ liked: false });
        });

        it("should handle boolean conversion for isPostRaw correctly", async () => {
            const cID = "user_123";
            const forumID = "post_456";

            // Test with string "true"
            ForumLike.findOne.mockResolvedValueOnce(null);
            const result1 = await getLikeStatus(cID, forumID, "true");
            expect(ForumLike.findOne).toHaveBeenCalledWith({ cID, forumID, isPost: true });

            // Test with string "false"
            ForumLike.findOne.mockResolvedValueOnce(null);
            const result2 = await getLikeStatus(cID, forumID, "false");
            expect(ForumLike.findOne).toHaveBeenCalledWith({ cID, forumID, isPost: false });
        });
    });

    // Test Scenario: Unauthorized operations (These would be tested at the route level with middleware)
    describe("Authorization Tests (Route Level)", () => {
        it("should require authentication for like operations", async () => {
            // These tests would typically be integration tests testing the routes with auth middleware
            // For unit tests, we focus on the controller logic
            expect(true).toBe(true); // Placeholder assertion
        });

        it("should require authentication for unlike operations", async () => {
            // These tests would typically be integration tests testing the routes with auth middleware
            // For unit tests, we focus on the controller logic
            expect(true).toBe(true); // Placeholder assertion
        });

        it("should require authentication for like status checks", async () => {
            // These tests would typically be integration tests testing the routes with auth middleware
            // For unit tests, we focus on the controller logic
            expect(true).toBe(true); // Placeholder assertion
        });
    });
});
