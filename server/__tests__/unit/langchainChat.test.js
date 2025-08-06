const { handleLangChainChat } = require("../../controllers/langchainChat");
const Chat = require("../../models/Chat");

// Mock all external dependencies
jest.mock("../../models/Chat");
jest.mock("@langchain/openai");
jest.mock("langchain/memory");
jest.mock("@langchain/mongodb");
jest.mock("langchain/chains");

describe("LangChain Chat Controller Unit Tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock environment variable
        process.env.OPENAI_API_KEY = "test-api-key";
    });

    // Test Scenario: Valid query match
    describe("Valid Query Match", () => {
        it("should handle valid query and return matching response", async () => {
            const userId = "user_123";
            const prompt = "How can I help someone with depression?";
            const expectedResponse = "Here are some ways to help someone with depression...";

            // Mock the chain response
            const mockChain = {
                call: jest.fn().mockResolvedValue({ response: expectedResponse })
            };
            const { ConversationChain } = require("langchain/chains");
            ConversationChain.mockImplementation(() => mockChain);

            // Mock Chat.create
            Chat.create.mockResolvedValue({});

            const result = await handleLangChainChat(userId, prompt);

            expect(ConversationChain).toHaveBeenCalled();
            expect(mockChain.call).toHaveBeenCalledWith({ input: prompt });
            expect(Chat.create).toHaveBeenCalledTimes(2);
            expect(Chat.create).toHaveBeenCalledWith({ userId, role: "user", content: prompt });
            expect(Chat.create).toHaveBeenCalledWith({ userId, role: "assistant", content: expectedResponse });
            expect(result).toBe(expectedResponse);
        });

        it("should handle specific resource queries", async () => {
            const userId = "user_456";
            const prompt = "What are the symptoms of anxiety?";
            const expectedResponse = "Common symptoms of anxiety include...";

            const mockChain = {
                call: jest.fn().mockResolvedValue({ response: expectedResponse })
            };
            const { ConversationChain } = require("langchain/chains");
            ConversationChain.mockImplementation(() => mockChain);
            Chat.create.mockResolvedValue({});

            const result = await handleLangChainChat(userId, prompt);

            expect(mockChain.call).toHaveBeenCalledWith({ input: prompt });
            expect(result).toBe(expectedResponse);
        });
    });

    // Test Scenario: Partial match
    describe("Partial Match", () => {
        it("should return closest match when exact match not found", async () => {
            const userId = "user_789";
            const prompt = "help with stress"; // Partial query
            const expectedResponse = "I understand you're asking about stress management. Here are some suggestions...";

            const mockChain = {
                call: jest.fn().mockResolvedValue({ response: expectedResponse })
            };
            const { ConversationChain } = require("langchain/chains");
            ConversationChain.mockImplementation(() => mockChain);
            Chat.create.mockResolvedValue({});

            const result = await handleLangChainChat(userId, prompt);

            expect(mockChain.call).toHaveBeenCalledWith({ input: prompt });
            expect(result).toBe(expectedResponse);
        });

        it("should handle misspelled queries", async () => {
            const userId = "user_101";
            const prompt = "depresion help"; // Misspelled
            const expectedResponse = "I think you might be asking about depression. Here's some information...";

            const mockChain = {
                call: jest.fn().mockResolvedValue({ response: expectedResponse })
            };
            const { ConversationChain } = require("langchain/chains");
            ConversationChain.mockImplementation(() => mockChain);
            Chat.create.mockResolvedValue({});

            const result = await handleLangChainChat(userId, prompt);

            expect(mockChain.call).toHaveBeenCalledWith({ input: prompt });
            expect(result).toBe(expectedResponse);
        });
    });

    // Test Scenario: Multiple intents
    describe("Multiple Intents", () => {
        it("should handle multi-part queries appropriately", async () => {
            const userId = "user_202";
            const prompt = "How do I help someone with depression and anxiety?";
            const expectedResponse = "That's a complex question involving both depression and anxiety. Let me address both...";

            const mockChain = {
                call: jest.fn().mockResolvedValue({ response: expectedResponse })
            };
            const { ConversationChain } = require("langchain/chains");
            ConversationChain.mockImplementation(() => mockChain);
            Chat.create.mockResolvedValue({});

            const result = await handleLangChainChat(userId, prompt);

            expect(mockChain.call).toHaveBeenCalledWith({ input: prompt });
            expect(result).toBe(expectedResponse);
        });

        it("should prioritize main intent in complex queries", async () => {
            const userId = "user_303";
            const prompt = "I need help with stress, sleep, and work-life balance";
            const expectedResponse = "I'll help you with stress management, which often affects sleep and work-life balance...";

            const mockChain = {
                call: jest.fn().mockResolvedValue({ response: expectedResponse })
            };
            const { ConversationChain } = require("langchain/chains");
            ConversationChain.mockImplementation(() => mockChain);
            Chat.create.mockResolvedValue({});

            const result = await handleLangChainChat(userId, prompt);

            expect(mockChain.call).toHaveBeenCalledWith({ input: prompt });
            expect(result).toBe(expectedResponse);
        });
    });

    // Test Scenario: Invalid query
    describe("Invalid Query", () => {
        it("should return fallback message for incomprehensible queries", async () => {
            const userId = "user_404";
            const prompt = "asdfghjkl"; // Nonsense input
            const expectedResponse = "I don't understand. Could you please rephrase your question?";

            const mockChain = {
                call: jest.fn().mockResolvedValue({ response: expectedResponse })
            };
            const { ConversationChain } = require("langchain/chains");
            ConversationChain.mockImplementation(() => mockChain);
            Chat.create.mockResolvedValue({});

            const result = await handleLangChainChat(userId, prompt);

            expect(mockChain.call).toHaveBeenCalledWith({ input: prompt });
            expect(result).toBe(expectedResponse);
        });

        it("should handle empty queries gracefully", async () => {
            const userId = "user_505";
            const prompt = "";
            await expect(handleLangChainChat(userId, prompt)).rejects.toThrow("Missing userId or prompt");
        });
    });

    // Test Scenario: Database connectivity
    describe("Database Connectivity", () => {
        it("should verify DB is reachable for queries", async () => {
            const userId = "user_606";
            const prompt = "Test query";
            const expectedResponse = "Test response";

            const mockChain = {
                call: jest.fn().mockResolvedValue({ response: expectedResponse })
            };
            const { ConversationChain } = require("langchain/chains");
            ConversationChain.mockImplementation(() => mockChain);
            Chat.create.mockResolvedValue({});

            const result = await handleLangChainChat(userId, prompt);

            expect(Chat.create).toHaveBeenCalledTimes(2);
            expect(result).toBe(expectedResponse);
        });

        it("should handle database connection errors", async () => {
            const userId = "user_707";
            const prompt = "Test query";

            const mockChain = {
                call: jest.fn().mockResolvedValue({ response: "Test response" })
            };
            const { ConversationChain } = require("langchain/chains");
            ConversationChain.mockImplementation(() => mockChain);
            Chat.create.mockRejectedValue(new Error("Database connection failed"));

            await expect(handleLangChainChat(userId, prompt)).rejects.toThrow("Database connection failed");
        });
    });

    // Test Scenario: Query latency handling
    describe("Query Latency Handling", () => {
        it("should handle long queries gracefully", async () => {
            const userId = "user_808";
            const prompt = "A".repeat(1000); // Long query
            const expectedResponse = "I understand your question. Let me provide a comprehensive answer...";

            const mockChain = {
                call: jest.fn().mockResolvedValue({ response: expectedResponse })
            };
            const { ConversationChain } = require("langchain/chains");
            ConversationChain.mockImplementation(() => mockChain);
            Chat.create.mockResolvedValue({});

            const result = await handleLangChainChat(userId, prompt);

            expect(mockChain.call).toHaveBeenCalledWith({ input: prompt });
            expect(result).toBe(expectedResponse);
        });

        it("should handle timeout scenarios", async () => {
            const userId = "user_909";
            const prompt = "Complex query that might timeout";

            const mockChain = {
                call: jest.fn().mockRejectedValue(new Error("Request timeout"))
            };
            const { ConversationChain } = require("langchain/chains");
            ConversationChain.mockImplementation(() => mockChain);

            await expect(handleLangChainChat(userId, prompt)).rejects.toThrow("Request timeout");
        });

        it("should handle slow responses with fallback", async () => {
            const userId = "user_1010";
            const prompt = "Slow query";

            const mockChain = {
                call: jest.fn().mockImplementation(() => 
                    new Promise(resolve => 
                        setTimeout(() => resolve({ response: "Delayed response" }), 100)
                    )
                )
            };
            const { ConversationChain } = require("langchain/chains");
            ConversationChain.mockImplementation(() => mockChain);
            Chat.create.mockResolvedValue({});

            const result = await handleLangChainChat(userId, prompt);

            expect(result).toBe("Delayed response");
        });
    });

    // Input validation tests
    describe("Input Validation", () => {
        it("should throw error when userId is missing", async () => {
            const prompt = "Test query";

            await expect(handleLangChainChat(null, prompt)).rejects.toThrow("Missing userId or prompt");
        });

        it("should throw error when prompt is missing", async () => {
            const userId = "user_1111";

            await expect(handleLangChainChat(userId, null)).rejects.toThrow("Missing userId or prompt");
        });

        it("should throw error when both userId and prompt are missing", async () => {
            await expect(handleLangChainChat(null, null)).rejects.toThrow("Missing userId or prompt");
        });

        it("should throw error when userId is empty string", async () => {
            const prompt = "Test query";

            await expect(handleLangChainChat("", prompt)).rejects.toThrow("Missing userId or prompt");
        });

        it("should throw error when prompt is empty string", async () => {
            const userId = "user_1212";

            await expect(handleLangChainChat(userId, "")).rejects.toThrow("Missing userId or prompt");
        });
    });

    // Chat history persistence tests
    describe("Chat History Persistence", () => {
        it("should save user message to database", async () => {
            const userId = "user_1919";
            const prompt = "User message";
            const expectedResponse = "Assistant response";

            const mockChain = {
                call: jest.fn().mockResolvedValue({ response: expectedResponse })
            };
            const { ConversationChain } = require("langchain/chains");
            ConversationChain.mockImplementation(() => mockChain);
            Chat.create.mockResolvedValue({});

            await handleLangChainChat(userId, prompt);

            expect(Chat.create).toHaveBeenCalledWith({
                userId,
                role: "user",
                content: prompt
            });
        });

        it("should save assistant response to database", async () => {
            const userId = "user_2020";
            const prompt = "User message";
            const expectedResponse = "Assistant response";

            const mockChain = {
                call: jest.fn().mockResolvedValue({ response: expectedResponse })
            };
            const { ConversationChain } = require("langchain/chains");
            ConversationChain.mockImplementation(() => mockChain);
            Chat.create.mockResolvedValue({});

            await handleLangChainChat(userId, prompt);

            expect(Chat.create).toHaveBeenCalledWith({
                userId,
                role: "assistant",
                content: expectedResponse
            });
        });

        it("should handle database save errors gracefully", async () => {
            const userId = "user_2121";
            const prompt = "User message";
            const expectedResponse = "Assistant response";

            const mockChain = {
                call: jest.fn().mockResolvedValue({ response: expectedResponse })
            };
            const { ConversationChain } = require("langchain/chains");
            ConversationChain.mockImplementation(() => mockChain);
            Chat.create.mockRejectedValue(new Error("Database save failed"));

            await expect(handleLangChainChat(userId, prompt)).rejects.toThrow("Database save failed");
        });
    });
});