const ResourceChat = require("../../models/ResourceChat")
const  {getChatbotResources, createChatbotResource, deleteAllChatbotResources}
= require("../../controllers/resourceChat")

jest.mock("../../models/ResourceChat")


describe("Resource Chat Controller Unit Testing", () => {
    afterEach(() => jest.clearAllMocks());

    test("getChatbotResources should return resources w/ unique category", async () => {
        const mockResources = [
        { title: "Title A", category: "Health", description: "desc", createdAt: new Date() },
        { title: "Title B", category: "Health", description: "desc", createdAt: new Date() },
        { title: "Title C", category: "Death", description: "desc", createdAt: new Date() },
        { title: "it's wonderful!!", category: "Spam", description: "desc", createdAt: new Date() }, // should be filtered out cause !r
        ];

        ResourceChat.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockResources),
        });

        const result = await getChatbotResources();

        expect(ResourceChat.find).toHaveBeenCalled();
        expect(result.resources.length).toBe(3); // 1 invalid title got filtered out
        expect(result.categories.sort()).toEqual(["Death", "Health"]);
    });

    test("createChatbotResource should throw error if there are missing fields", async () => {
        const badData = { title: " ", description: "", eligibility: [], steps: [] }; 
        await expect(createChatbotResource(badData)).rejects.toThrow("Invalid resource data.");
    });
    
    test("createChatbotResource should create and return new resource", async () => {
        const mockResourceData = {
        title: "Help",
        description: "Valid desc",
        eligibility: [],
        steps: [],
        link: "http://exmaple.com",
        category: "General",
        tags: [],
        note: "",
        };

        const mockSave = jest.fn().mockResolvedValue(mockResourceData);
        ResourceChat.mockImplementation(() => ({
        ...mockResourceData,
        save: mockSave,
        }));

        const result = await createChatbotResource(mockResourceData);

        expect(mockSave).toHaveBeenCalled();
        expect(result).toEqual(expect.objectContaining(mockResourceData));
    });

    test("deleteAllChatbotResources should delete all resources", async () => {
        ResourceChat.deleteMany.mockResolvedValue({ acknowledged: true });
        const result = await deleteAllChatbotResources();

        expect(ResourceChat.deleteMany).toHaveBeenCalledWith({});
        await expect(result).toEqual({ message: "All chatbot resources deleted." });
    });
});