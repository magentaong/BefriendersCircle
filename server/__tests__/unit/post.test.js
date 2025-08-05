const { getPost, createPost,getPostsByBoardName, getPostDetails, deletePostAndComments}
= require("../../controllers/post")

const Post = require("../../models/Post");
const Board = require("../../models/Board");
const Comment = require("../../models/Comment");

jest.mock("../../models/Post")
jest.mock("../../models/Board")
jest.mock("../../models/Comment")

describe("Post Controller Unit Testing", () => {
    afterEach(() => jest.clearAllMocks());

    it("getPost should return all posts", async () => {
        const mockPosts = [{pID:"123", content: "test"}];
        Post.find.mockResolvedValue(mockPosts);
        const result = await getPost();
        expect(Post.find).toHaveBeenCalled();
        expect(result).toEqual(mockPosts)
    });

    it("createPost should return new post", async() => {
        const mockPostData = { title:"Testing123" }; 
        mockSave = jest.fn().mockResolvedValue(mockPostData);
        Post.mockImplementation(() => ({ 
            ...mockPostData,
            save: mockSave, 
        }));
        const result = await createPost(mockPostData);
        expect(mockSave).toHaveBeenCalled();

        // expect result to equal to an object that contains the post data
        expect(result).toEqual(expect.objectContaining(mockPostData));
    })

    it("getPostsByBoardName should return a post by board name", async() => {
        const mockBoard = { bID:"board1" };
        const mockPosts = [{ pID:"post1"}];
        const mockComments = [{pID: "post1", message: "Nice"}]

        Board.findOne.mockResolvedValue(mockBoard);
        Post.find.mockResolvedValue(mockPosts);
        Comment.find.mockResolvedValue(mockComments);

        const result = await getPostsByBoardName("board1")
        expect(Board.findOne).toHaveBeenCalledWith({ name: "board1" });
        expect(Post.find).toHaveBeenCalledWith({ bID: "board1" });
        expect(Comment.find).toHaveBeenCalledWith({ pID: { $in: ["post1"] } });
        expect(result).toEqual({bID: "board1", posts: mockPosts, comments: mockComments,
        });
    })

    it("getPostsByBoardName should throw error if board is not found", async() => {
        
        Board.findOne.mockResolvedValue(null);
        const result = getPostsByBoardName("board1")
    
        await expect(result).rejects.toEqual({ 
            status: 404, message: "Board not found"
        });
    })

    it("getPostDeatils should return comments", async() => {
        const mockPosts = { pID:"p1"};
        const mockComments = [{pID: "p1", message: "Nice"}]

        Post.findOne.mockResolvedValue(mockPosts);
        Comment.find.mockResolvedValue(mockComments);

        const result = await getPostDetails("p1")
        expect(Post.findOne).toHaveBeenCalledWith({ pID: "p1" });
        expect(Comment.find).toHaveBeenCalledWith({ pID: "p1" });
        expect(result).toEqual({post: mockPosts, comments: mockComments,
        });
    })

    it("getPostDetails should throw error when post is not found", async() => {
    
        Post.findOne.mockResolvedValue(null);
        const result = getPostDetails("board1")
    
        await expect(result).rejects.toEqual({ 
            status: 404, message: "Post not found"
        });
    })

    it("deletePostAndComments should delete both post and comments ", async() => {
        const mockComments = [{pID: "p1", message: "Nice"}]

        Post.deleteOne.mockResolvedValue({ deletedCount: 1 })
        Comment.deleteMany.mockResolvedValue(mockComments)

        const result = await deletePostAndComments("p1")
        await expect(result).toEqual({message: "Post and associated comments deleted"})
    })

    it("deletePostAndComments should throw error if not deleted ", async() => {
        Post.deleteOne.mockResolvedValue({deletedCount: 0})
        const result = deletePostAndComments("p1")
        await expect(result).rejects.toEqual({status: 404, message: "Post not found"})
    })

});