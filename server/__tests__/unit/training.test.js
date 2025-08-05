const {getTrainingByCIDAndTitle,updateTraining, createTraining,
} = require("../../controllers/training");

const Training = require("../../models/Training");

jest.mock("../../models/Training");

describe("Training Controller Unit Tests", () => {
    afterEach(() => jest.clearAllMocks());

    it("getTrainingByCIDAndTitle should return training", async () => {
        const mockTraining = { tID: "1", title: "Sample", cID: "CID123" };
        Training.findOne.mockResolvedValue(mockTraining);

        const result = await getTrainingByCIDAndTitle("CID123", "Sample");
        expect(Training.findOne).toHaveBeenCalledWith({ cID: "CID123", title: "Sample" });
        expect(result).toEqual(mockTraining);
    });

    it("getTrainingByCIDAndTitle should throw error no cID or title", async () => {
        await expect(getTrainingByCIDAndTitle(null, "Sample")).rejects.toThrow("Missing cID or title query parameters.");
    });
    
    it("getTrainingByCIDAndTitle should throw if cID is missing", async () => {
        await expect(getTrainingByCIDAndTitle(undefined, "Sample"))
            .rejects.toThrow("Missing cID or title query parameters.");
    });

    it("getTrainingByCIDAndTitle should throw if title is missing", async () => {
        await expect(getTrainingByCIDAndTitle("CID123", undefined))
            .rejects.toThrow("Missing cID or title query parameters.");
    });

    it("getTrainingByCIDAndTitle should throw if both cID and title are missing", async () => {
        await expect(getTrainingByCIDAndTitle())
            .rejects.toThrow("Missing cID or title query parameters.");
        });

    it("getTrainingByCIDAndTitle should throw error if not found", async () => {
        Training.findOne.mockResolvedValue(null);
        await expect(getTrainingByCIDAndTitle("CID123", "Sample")).rejects.toThrow("Training not found.");
    });

    test("updateTraining should return updated training", async () => {
        const mockUpdate = { tID: "1", status: true };
        Training.findOneAndUpdate.mockResolvedValue(mockUpdate);

        const result = await updateTraining("1", { status: true });
        expect(Training.findOneAndUpdate).toHaveBeenCalledWith({ tID: "1" }, { status: true }, { new: true });
        expect(result).toEqual(mockUpdate);
    });

    test("updateTraining should throw if not found", async () => {
        Training.findOneAndUpdate.mockResolvedValue(null);
        await expect(updateTraining("123", {})).rejects.toThrow("Training not found.");
    });

    it("createTraining should return existing training if already exists", async () => {
        const existing = { tID: "1", cID: "CID123", title: "Sample" };
        Training.findOne.mockResolvedValue(existing);

        const result = await createTraining({ tID: "1", cID: "CID123", title: "Sample" });
        expect(result).toEqual({ exists: true, training: existing });
    });

    it("createTraining should create and return new training", async () => {
        const trainingInput = { tID: "2", cID: "CID123", title: "KMS", coverImg: null };
        const mockSave = jest.fn().mockResolvedValue({ 
            ...trainingInput, 
            progress: 0, 
            status: false });

        Training.findOne.mockResolvedValue(null);
        Training.mockImplementation(() => ({ 
            ...trainingInput, 
            progress: 0, 
            status: false, 
            save: mockSave }));

        const result = await createTraining(trainingInput);
        expect(result.exists).toBe(false);
        expect(result.training).toEqual(expect.objectContaining({
        tID: "2",
        cID: "CID123",
        title: "KMS"
        }));
    });

    it("createTraining should throw if missing fields", async () => {
        await expect(createTraining({})).rejects.toThrow("Missing required fields.");
    });

    it("createTraining should throw if tID is missing", async () => {
        await expect(createTraining({ cID: "CID123", title: "Sample" }))
        .rejects.toThrow("Missing required fields.");
    });

    it("createTraining should throw if cID is missing", async () => {
        await expect(createTraining({ tID: "T123", title: "Sample" }))
        .rejects.toThrow("Missing required fields.");
    });

    it("createTraining should throw if title is missing", async () => {
        await expect(createTraining({ tID: "T123", cID: "CID123" }))
            .rejects.toThrow("Missing required fields.");
    });
});
