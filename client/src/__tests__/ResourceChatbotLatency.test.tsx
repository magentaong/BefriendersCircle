import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

let mockAnswer: any = null;
let mockVerifiedResource: any = null;
let mockRelatedSchemes: any[] = [];
let mockError = "";
let mockLatency = false;
let mockLoading = false;
let mockInitialLoad = false;
let fetchResponseMock = vi.fn();
let setErrorMock = vi.fn();

vi.mock("../hooks/useChatbotAPI", () => ({
  useChatbotAPI: () => ({
    fetchResponse: fetchResponseMock,
    answer: mockAnswer,
    setAnswer: vi.fn(),
    verifiedResource: mockVerifiedResource,
    relatedSchemes: mockRelatedSchemes,
    error: mockError,
    setError: setErrorMock,
    loading: mockLoading,
    latency: mockLatency,
    initialLoad: mockInitialLoad,
    setLatency: vi.fn(),
    setInitialLoad: vi.fn(),
  }),
}));

vi.mock("../hooks/useResourceChat", () => ({
  useResourceChat: () => ({
    resources: [],
    categories: ["Chatbot", "General"],
    loading: false,
    error: "",
    refetch: vi.fn(),
  }),
}));

import ResourceLibrary from "../pages/Resources";

describe("<ResourceLibrary /> Chatbot Latency & Query Handling", () => {
  afterEach(() => {
    mockAnswer = null;
    mockVerifiedResource = null;
    mockRelatedSchemes = [];
    mockError = "";
    mockLatency = false;
    mockLoading = false;
    mockInitialLoad = false;
    fetchResponseMock = vi.fn();
    setErrorMock = vi.fn();
    vi.clearAllMocks();
  });

  it("displays error message when chatbot interface fails to load", async () => {
    fetchResponseMock.mockImplementationOnce(async () => {
      throw new Error("Chat interface failed to load");
    });

    mockError = "Chat interface failed to load";

    render(<ResourceLibrary />, { wrapper: MemoryRouter });
    expect(await screen.findByText(/chat interface failed to load/i)).toBeInTheDocument();
  });


  // Render latency and restart button
  it("shows yellow latency banner and restart button if chatbot response is slow", () => {
    mockLatency = true;
    render(<ResourceLibrary />, { wrapper: MemoryRouter });

    expect(screen.getByText(/The chatbot is taking longer than expected/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Restart Chatbot/i })).toBeInTheDocument();
  });


  // Fetch response
  it("clicking Restart Chatbot calls fetchResponse and setError", () => {
    mockLatency = true;
    render(<ResourceLibrary />, { wrapper: MemoryRouter });

    const restartBtn = screen.getByRole("button", { name: /Restart Chatbot/i });
    fireEvent.click(restartBtn);
    expect(setErrorMock).toHaveBeenCalledWith("");
    expect(fetchResponseMock).toHaveBeenCalled();
  });

  it("shows a fallback/welcome message for irrelevant queries", () => {
    // Show message 1
    mockAnswer = {
        title: "Fallback",
        description:
        "I’m here to help with senior care, healthcare, and financial support in Singapore. Could you share more about the help you’re looking for?",
    };
    render(<ResourceLibrary />, { wrapper: MemoryRouter });
    expect(
        screen.getByText(/senior care, healthcare, and financial support in singapore/i)
    ).toBeInTheDocument();

    // Show message 2
    mockAnswer = {
        title: "Fallback",
        description:
        "Type your question in the search box or tap the microphone icon. You can also click on one of the suggested prompts.",
    };
    render(<ResourceLibrary />, { wrapper: MemoryRouter });
    expect(
        screen.getByText(/type your question in the search box or tap the microphone icon/i)
    ).toBeInTheDocument();
   });


  it("shows partial match result if prompt matches a resource partially", () => {
    // Simulate a partial/closest match result
    mockAnswer = {
      title: "Elderly Mobility Subsidy",
      description: "This scheme helps with mobility support for seniors.",
      eligibility: ["Singapore citizen", "Age 60+"],
      steps: ["Apply online"],
      link: "https://example.com/mobility",
      tags: ["mobility", "subsidy"],
      category: "General",
    };
    render(<ResourceLibrary />, { wrapper: MemoryRouter });

    expect(screen.getByText(/Elderly Mobility Subsidy/)).toBeInTheDocument();
    expect(screen.getByText(/mobility support for seniors/i)).toBeInTheDocument();
    expect(screen.getByText(/Singapore citizen/i)).toBeInTheDocument();
    expect(screen.getByText(/Apply online/i)).toBeInTheDocument();
  });
});
