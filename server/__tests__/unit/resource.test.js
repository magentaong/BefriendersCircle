const Resource = require("../../models/Resource");
const { getResources, createResource, getCategories, reloadResources} = require("../../controllers/resource")

jest.mock("../../models/Resource")

describe("Resource Controller Unit Testing", () => {
    afterEach(() => jest.clearAllMocks());

    it("getResources should return all resources", async () => {
        const mockResources = [{content: "test"}];
        Resource.find.mockResolvedValue(mockResources);
        const result = await getResources();
        expect(Resource.find).toHaveBeenCalled();
        expect(result).toEqual(mockResources)
    });

    it("createResource should return new Resource", async() => {
        const mockResourceData = { title:"Testing123" }; 
        mockSave = jest.fn().mockResolvedValue(mockResourceData);
        Resource.mockImplementation(() => ({ 
            ...mockResourceData,
            save: mockSave, 
        }));
        const result = await createResource(mockResourceData);
        expect(mockSave).toHaveBeenCalled();

        // expect result to equal to an object that contains the post data
        expect(result).toEqual(expect.objectContaining(mockResourceData));
    })

    it("getCategories should return Resource with categories", async() => {
        const mockCategoryData = ["Health", "Death"]; 
        Resource.distinct.mockResolvedValue(mockCategoryData);

        const result = await getCategories()
        expect(Resource.distinct).toHaveBeenCalledWith("category")
        expect(result).toEqual(mockCategoryData)
    })

    it("reloadResources should return sorted resources and unique categories", async () => {
    const mockResources = [
        { title: "r1", category: "Health" },
        { title: "r2", category: "Death" },
        { title: "r3" }, // no category should default to General 
        ];
        Resource.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockResources)
        });

        const result = await reloadResources();

        expect(Resource.find).toHaveBeenCalled();
        expect(result.resources).toEqual(mockResources);
        expect(result.categories).toEqual(["Health", "Death", "General"]);
    });
});