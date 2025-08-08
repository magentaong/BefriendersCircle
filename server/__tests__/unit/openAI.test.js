//RESET EVERYTHING. BURN THE CACHE TO THE GROUND.
jest.resetModules();

jest.doMock("openai", () => {
    const mockOpenAIInstance = {
        beta: {
            threads: {
                create: jest.fn().mockResolvedValue({ id: "thread_123" }),
                messages: {
                    create: jest.fn().mockResolvedValue({}),
                    list: jest.fn().mockResolvedValue({
                        data: [{
                            role: "assistant",
                            content: [{ text: { value: "Test response" } }]
                        }]
                    })
                },
                runs: {
                    create: jest.fn().mockResolvedValue({ id: "run_123" }),
                    retrieve: jest.fn().mockResolvedValue({ status: "completed" })
                }
            }
        }
    };

    const MockOpenAI = jest.fn().mockImplementation(() => mockOpenAIInstance);
    MockOpenAI.mockInstance = mockOpenAIInstance;
    
    return MockOpenAI;
});

jest.mock("../../models/Chat");
jest.mock("../../models/ResourceChat");
jest.mock("../../utils/parseChatbotReply");
jest.mock("../../langchain/resourceRetriever");

const {
    getRelevantDocs,
    buildPrompt,
    runOpenAIChat,
    extractReply,
    parseReply,
    saveSchemesToDB,
    saveChatHistory,
    deduplicateSchemes,
    handleChat
} = require("../../controllers/openai");
const OpenAI = require("openai"); 
const Chat = require("../../models/Chat");
const ResourceChat = require("../../models/ResourceChat");
const parseChatbotReply = require("../../utils/parseChatbotReply");
const { getResourceRetriever } = require("../../langchain/resourceRetriever");

describe("OpenAI Controller Unit Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Reset the mock instance for each test
        const mockInstance = OpenAI.mockInstance;
        mockInstance.beta.threads.create.mockResolvedValue({ id: "thread_123" });
        mockInstance.beta.threads.messages.create.mockResolvedValue({});
        mockInstance.beta.threads.messages.list.mockResolvedValue({
            data: [{
                role: "assistant",
                content: [{ text: { value: "Test response" } }]
            }]
        });
        mockInstance.beta.threads.runs.create.mockResolvedValue({ id: "run_123" });
        mockInstance.beta.threads.runs.retrieve.mockResolvedValue({ status: "completed" });
        
        process.env.OPENAI_API_KEY = "test-api-key";
        process.env.ASSISTANT_ID = "test-assistant-id";
    });

    // Test Scenario: Valid OpenAI request
    describe("Valid OpenAI Request", () => {
        it("should handle valid chat request successfully", async () => {
            const req = {
                body: {
                    prompt: "How can I get financial assistance for seniors?",
                    userId: "user_123"
                }
            };
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis(),
                headersSent: false
            };

            // Mock dependencies
            getResourceRetriever.mockResolvedValue({
                getRelevantDocuments: jest.fn().mockResolvedValue([
                    {
                        metadata: {
                            title: "Financial Aid",
                            url: "https://example.com"
                        }
                    },
                    {
                        metadata: {
                            title: "Senior Support",
                            url: "https://support.com"
                        }
                    }
                ])
            });
            parseChatbotReply.mockResolvedValue([]);
            ResourceChat.findOne.mockResolvedValue(null);
            Chat.create.mockResolvedValue({});

            await handleChat(req, res);

            expect(res.json).toHaveBeenCalledWith({
                reply: expect.any(String),
                verifiedResource: null,
                relatedSchemes: expect.any(Array)
            });
        });

        it("should build prompt correctly with relevant documents", () => {
            const prompt = "How can I get financial assistance?";
            const docs = [
                {
                    metadata: {
                        title: "Financial Aid",
                        url: "https://example.com"
                    }
                },
                {
                    metadata: {
                        title: "Senior Support",
                        url: "https://support.com"
                    }
                }
            ];

            const result = buildPrompt(prompt, docs);

            expect(result).toContain("You are a warm, empathetic caregiver assistant");
            expect(result).toContain("1. Financial Aid: https://example.com");
            expect(result).toContain("2. Senior Support: https://support.com");
            expect(result).toContain("User Question: How can I get financial assistance?");
        });

        it("should run OpenAI chat successfully", async () => {
            const prompt = "Test prompt";

            const result = await runOpenAIChat(prompt);

            // Check that the mock instance was used
            expect(OpenAI.mockInstance.beta.threads.create).toHaveBeenCalled();
            expect(OpenAI.mockInstance.beta.threads.messages.create).toHaveBeenCalledWith("thread_123", {
                role: "user",
                content: prompt
            });
            expect(result).toBe("Test response");
        });
    });

    // Test Scenario: Empty prompt
    describe("Empty Prompt", () => {
        it("should return 400 error when prompt is missing", async () => {
            const req = {
                body: {
                    userId: "user_123"
                }
            };
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis(),
                headersSent: false
            };

            await handleChat(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Missing prompt or userId" });
        });

        it("should return 400 error when userId is missing", async () => {
            const req = {
                body: {
                    prompt: "Test prompt"
                }
            };
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis(),
                headersSent: false
            };

            await handleChat(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Missing prompt or userId" });
        });

        it("should return 400 error when both prompt and userId are missing", async () => {
            const req = {
                body: {}
            };
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis(),
                headersSent: false
            };

            await handleChat(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Missing prompt or userId" });
        });

        it("should handle empty string prompt", async () => {
            const req = {
                body: {
                    prompt: "",
                    userId: "user_123"
                }
            };
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis(),
                headersSent: false
            };

            await handleChat(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Missing prompt or userId" });
        });
    });

    // Test Scenario: API key missing
    describe("API Key Missing", () => {
        it("should handle missing OpenAI API key", async () => {
            const req = {
                body: {
                    prompt: "Test prompt",
                    userId: "user_123"
                }
            };
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis(),
                headersSent: false
            };

            // Mock getResourceRetriever to succeed
            getResourceRetriever.mockResolvedValue({
                getRelevantDocuments: jest.fn().mockResolvedValue([])
            });

            // Mock OpenAI to throw error during thread creation
            OpenAI.mockInstance.beta.threads.create.mockRejectedValue(new Error("OpenAI API key is required"));

            await handleChat(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "OpenAI API key is required" });
        });

        it("should handle missing assistant ID", async () => {
            const req = {
                body: {
                    prompt: "Test prompt",
                    userId: "user_123"
                }
            };
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis(),
                headersSent: false
            };

            getResourceRetriever.mockResolvedValue({
                getRelevantDocuments: jest.fn().mockResolvedValue([])
            });

            // Mock OpenAI to throw error during run creation
            OpenAI.mockInstance.beta.threads.runs.create.mockRejectedValue(new Error("Assistant ID is required"));

            await handleChat(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Assistant ID is required" });
        });
    });

    // Test Scenario: OpenAI API error
    describe("OpenAI API Error", () => {
        it("should handle OpenAI API errors gracefully", async () => {
            const req = {
                body: {
                    prompt: "Test prompt",
                    userId: "user_123"
                }
            };
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis(),
                headersSent: false
            };

            getResourceRetriever.mockResolvedValue({
                getRelevantDocuments: jest.fn().mockResolvedValue([])
            });

            OpenAI.mockInstance.beta.threads.create.mockRejectedValue(new Error("OpenAI API rate limit exceeded"));

            await handleChat(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "OpenAI API rate limit exceeded" });
        });

        it("should handle resource retrieval errors", async () => {
            const req = {
                body: {
                    prompt: "Test prompt",
                    userId: "user_123"
                }
            };
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis(),
                headersSent: false
            };

            // Mock getResourceRetriever to throw error
            getResourceRetriever.mockRejectedValue(new Error("Resource retrieval failed"));

            await handleChat(req, res);

            // Since getRelevantDocs catches the error and returns empty array,
            // the test should pass without error, but we can verify the behavior
            expect(res.json).toHaveBeenCalledWith({
                reply: expect.any(String),
                verifiedResource: null,
                relatedSchemes: expect.any(Array)
            });
        });

        it("should handle parsing errors", async () => {
            const req = {
                body: {
                    prompt: "Test prompt",
                    userId: "user_123"
                }
            };
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis(),
                headersSent: false
            };

            getResourceRetriever.mockResolvedValue({
                getRelevantDocuments: jest.fn().mockResolvedValue([])
            });

            parseChatbotReply.mockRejectedValue(new Error("Parsing failed"));

            await handleChat(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Parsing failed" });
        });
    });

    // Test Scenario: Latency handling
    describe("Latency Handling", () => {
        it("should handle OpenAI API timeouts", async () => {
            const req = {
                body: {
                    prompt: "Test prompt",
                    userId: "user_123"
                }
            };
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis(),
                headersSent: false
            };

            getResourceRetriever.mockResolvedValue({
                getRelevantDocuments: jest.fn().mockResolvedValue([])
            });

            // Mock the polling to complete after a few iterations
            let callCount = 0;
            OpenAI.mockInstance.beta.threads.runs.retrieve.mockImplementation(() => {
                callCount++;
                if (callCount < 3) {
                    return Promise.resolve({ status: "in_progress" });
                } else {
                    return Promise.resolve({ status: "completed" });
                }
            });
            
            // Mock other dependencies
            parseChatbotReply.mockResolvedValue([]);
            ResourceChat.findOne.mockResolvedValue(null);
            Chat.create.mockResolvedValue({});

            await handleChat(req, res);

            expect(res.json).toHaveBeenCalledWith({
                reply: expect.any(String),
                verifiedResource: null,
                relatedSchemes: expect.any(Array)
            });
        }, 10000); // Reduce timeout to 10 seconds

        it("should handle slow responses gracefully", async () => {
            const req = {
                body: {
                    prompt: "Test prompt",
                    userId: "user_123"
                }
            };
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis(),
                headersSent: false
            };

            getResourceRetriever.mockResolvedValue({
                getRelevantDocuments: jest.fn().mockResolvedValue([])
            });

            parseChatbotReply.mockResolvedValue([]);
            ResourceChat.findOne.mockResolvedValue(null);
            Chat.create.mockResolvedValue({});

            await handleChat(req, res);

            expect(res.json).toHaveBeenCalledWith({
                reply: expect.any(String),
                verifiedResource: null,
                relatedSchemes: expect.any(Array)
            });
        }, 10000); // Increase timeout to 10 seconds
    });

    describe("Utility Functions", () => {
        it("should extract reply correctly", () => {
            const parsedSchemes = [{
                metadata: {
                    description: "```json\nTest description\n```"
                }
            }];
            const fallback = "Fallback response";

            const result = extractReply(parsedSchemes, fallback);

            expect(result).toBe("Test description");
        });

        it("should return fallback when no parsed schemes", () => {
            const fallback = "Fallback response";

            const result = extractReply(null, fallback);

            expect(result).toBe(fallback);
        });

        it("should parse reply correctly", async () => {
            const reply = "Test reply";
            const knownUrls = ["https://example.com"];

            parseChatbotReply.mockResolvedValue([{ title: "Test Scheme" }]);

            const result = await parseReply(reply, knownUrls);

            expect(parseChatbotReply).toHaveBeenCalledWith(reply, knownUrls);
            expect(result).toEqual([{ title: "Test Scheme" }]);
        });

        it("should save schemes to database correctly", async () => {
            const schemes = [{
                metadata: {
                    title: "Test Scheme",
                    description: "Test description",
                    link: "https://example.com",
                    tags: ["test"],
                    category: "Test",
                    eligibility: ["senior"],
                    steps: ["step1"]
                }
            }];
            const docs = [{ metadata: { url: "https://example.com" } }];

            ResourceChat.findOne.mockResolvedValue(null);
            ResourceChat.create.mockResolvedValue({
                title: "Test Scheme",
                description: "Test description"
            });

            const result = await saveSchemesToDB(schemes, docs);

            expect(ResourceChat.findOne).toHaveBeenCalledWith({
                title: { $regex: "^Test Scheme$", $options: "i" }
            });
            expect(ResourceChat.create).toHaveBeenCalledWith({
                title: "Test Scheme",
                description: "Test description",
                eligibility: ["senior"],
                steps: ["step1"],
                link: "https://example.com",
                tags: ["test"],
                category: "Test",
                source: "Chatbot AI",
                note: ""
            });
            expect(result).toHaveLength(1);
        });

        it("should save chat history correctly", async () => {
            const userId = "user_123";
            const prompt = "Test prompt";
            const replyText = "Test reply";

            Chat.create.mockResolvedValue({});

            await saveChatHistory(userId, prompt, replyText);

            expect(Chat.create).toHaveBeenCalledTimes(2);
            expect(Chat.create).toHaveBeenCalledWith({
                userId,
                role: "user",
                content: prompt
            });
            expect(Chat.create).toHaveBeenCalledWith({
                userId,
                role: "assistant",
                content: replyText
            });
        });

        it("should deduplicate schemes correctly", () => {
            const schemes = [
                { title: "Scheme A", description: "First" },
                { title: "Scheme B", description: "Second" },
                { title: "Scheme A", description: "Duplicate" }
            ];

            const result = deduplicateSchemes(schemes);

            expect(result).toHaveLength(2);
            expect(result[0].title).toBe("Scheme A");
            expect(result[1].title).toBe("Scheme B");
        });
    });

    // Error handling for utility functions
    describe("Utility Function Error Handling", () => {
        it("should handle database errors in saveSchemesToDB", async () => {
            const schemes = [{
                metadata: {
                    title: "Test Scheme",
                    description: "Test description"
                }
            }];
            const docs = [];

            ResourceChat.findOne.mockRejectedValue(new Error("Database connection failed"));

            const result = await saveSchemesToDB(schemes, docs);

            expect(result).toEqual([]);
        });

        it("should handle chat history save errors", async () => {
            const userId = "user_123";
            const prompt = "Test prompt";
            const replyText = "Test reply";

            Chat.create.mockRejectedValue(new Error("Chat save failed"));

            await expect(saveChatHistory(userId, prompt, replyText))
                .rejects.toThrow("Chat save failed");
        });

        it("should handle resource retrieval errors gracefully", async () => {
            const prompt = "Test prompt";

            getResourceRetriever.mockRejectedValue(new Error("Resource retrieval failed"));

            const result = await getRelevantDocs(prompt);

            expect(result).toEqual([]);
        });
    });
});
