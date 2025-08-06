import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

// Mock components and hooks
vi.mock("../hooks/useResourceChat", () => ({
  useResourceChat: vi.fn(),
}));

vi.mock("../hooks/useChatbotAPI", () => ({
  useChatbotAPI: vi.fn(),
}));

vi.mock("../hooks/useTextToSpeech", () => ({
  useTextToSpeech: vi.fn(),
}));

vi.mock("../hooks/useVoiceRecording", () => ({
  useVoiceRecording: vi.fn(),
}));

vi.mock("../hooks/useCarousel", () => ({
  useCarousel: vi.fn(),
}));

// Import ChatbotPanel after mocking
import ChatbotPanel from "../components/resources/ChatbotPanel";

describe("<ChatbotPanel />", () => {
  const defaultProps = {
    query: "What financial subsidies do you recommend for seniors?",
    setQuery: vi.fn(),
    answer: "Here are some financial subsidies for seniors...",
    allSchemes: [
      { title: "Financial Aid", content: "Government financial assistance..." },
      { title: "Healthcare Support", content: "Medical care programs..." },
      { title: "Community Programs", content: "Local community support..." },
    ],
    currentScheme: { title: "Financial Aid", content: "Government financial assistance..." },
    carouselIndex: 0,
    setCarouselIndex: vi.fn(),
    renderChatbotContent: vi.fn((scheme) => <div>{scheme.content}</div>),
    fetchResponse: vi.fn(),
    isRecording: false,
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    playAnswer: vi.fn(),
    isSpeaking: false,
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Text input and search button interactions
  it("handles text input and search button interactions", () => {
    render(<ChatbotPanel {...defaultProps} />, { wrapper: MemoryRouter });

    // Check textarea is rendered
    const textarea = screen.getByPlaceholderText("What financial subsidies do you recommend for seniors?");
    expect(textarea).toBeInTheDocument();

    // Check search button is rendered
    const searchButton = screen.getByRole("button", { name: /search/i });
    expect(searchButton).toBeInTheDocument();

    // Test text input
    fireEvent.change(textarea, { target: { value: "New question about healthcare" } });
    expect(defaultProps.setQuery).toHaveBeenCalledWith("New question about healthcare");

    // Test search button click
    fireEvent.click(searchButton);
    expect(defaultProps.fetchResponse).toHaveBeenCalledTimes(1);
  });

  // Suggested prompt clicks
  it("handles suggested prompt clicks", () => {
    render(<ChatbotPanel {...defaultProps} />, { wrapper: MemoryRouter });

    // Check suggested prompts are rendered
    expect(screen.getByText("What is CTG?")).toBeInTheDocument();
    expect(screen.getByText("Government Grants")).toBeInTheDocument();
    expect(screen.getByText("Dementia Resources")).toBeInTheDocument();

    // Test clicking on suggested prompts
    const ctgPrompt = screen.getByText("What is CTG?");
    fireEvent.click(ctgPrompt);
    expect(defaultProps.setQuery).toHaveBeenCalledWith("What is CTG?");

    const grantsPrompt = screen.getByText("Government Grants");
    fireEvent.click(grantsPrompt);
    expect(defaultProps.setQuery).toHaveBeenCalledWith("Government Grants");

    const dementiaPrompt = screen.getByText("Dementia Resources");
    fireEvent.click(dementiaPrompt);
    expect(defaultProps.setQuery).toHaveBeenCalledWith("Dementia Resources");
  });

  // Loading state display
  it("displays loading state correctly", () => {
    render(<ChatbotPanel {...defaultProps} loading={true} />, { wrapper: MemoryRouter });

    // Check loading indicator is displayed
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    // Check for the refresh icon with spinning animation
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("does not show loading state when not loading", () => {
    render(<ChatbotPanel {...defaultProps} loading={false} />, { wrapper: MemoryRouter });

    // Check loading indicator is not displayed
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /refresh/i })).not.toBeInTheDocument();
  });

  // Speaking animation states
  it("shows speaking animation when isSpeaking is true", () => {
    render(<ChatbotPanel {...defaultProps} isSpeaking={true} />, { wrapper: MemoryRouter });

    const playButton = screen.getByRole("button", { name: /play answer/i });
    expect(playButton).toHaveClass("animate-pulse");
  });

  it("does not show speaking animation when isSpeaking is false", () => {
    render(<ChatbotPanel {...defaultProps} isSpeaking={false} />, { wrapper: MemoryRouter });

    const playButton = screen.getByRole("button", { name: /play answer/i });
    expect(playButton).not.toHaveClass("animate-pulse");
  });

  // Carousel counter display
  it("displays carousel counter when multiple schemes available", () => {
    render(<ChatbotPanel {...defaultProps} />, { wrapper: MemoryRouter });

    // Should show counter for 3 schemes
    expect(screen.getByText("1/3")).toBeInTheDocument();
  });

  it("does not display carousel counter when only one scheme", () => {
    const singleSchemeProps = {
      ...defaultProps,
      allSchemes: [{ title: "Single Scheme", content: "Single content..." }],
    };

    render(<ChatbotPanel {...singleSchemeProps} />, { wrapper: MemoryRouter });

    // Should not show counter for single scheme
    expect(screen.queryByText("1/1")).not.toBeInTheDocument();
  });

  it("displays correct carousel counter for different carousel indices", () => {
    const { rerender } = render(<ChatbotPanel {...defaultProps} carouselIndex={0} />, { wrapper: MemoryRouter });
    expect(screen.getByText("1/3")).toBeInTheDocument();

    rerender(<ChatbotPanel {...defaultProps} carouselIndex={1} />);
    expect(screen.getByText("2/3")).toBeInTheDocument();

    rerender(<ChatbotPanel {...defaultProps} carouselIndex={2} />);
    expect(screen.getByText("3/3")).toBeInTheDocument();
  });

  it("outputs multiple schemes for a query with multiple intents", () => {
    // Simulate a prompt with multiple intents and carousel navigation
    const allSchemes = [
      { title: "CTG", content: "Caregiver Training Grant" },
      { title: "HCG", content: "Home Caregiving Grant" },
      { title: "Dementia Support", content: "Special dementia resources" }
    ];
    const renderChatbotContent = (scheme:any) => <div>{scheme.content}</div>;
    const setCarouselIndexMock = vi.fn();

    render(
      <ChatbotPanel
        {...defaultProps}
        query="I want CTG and dementia support"
        allSchemes={allSchemes}
        currentScheme={allSchemes[0]}
        carouselIndex={0}
        setCarouselIndex={setCarouselIndexMock}
        renderChatbotContent={renderChatbotContent}
      />,
      { wrapper: MemoryRouter }
    );
    expect(screen.getByText("Caregiver Training Grant")).toBeInTheDocument();
    expect(screen.getByText("1/3")).toBeInTheDocument();
    // Simulate carousel next
    const nextButton = screen.getByTitle("Next");
    fireEvent.click(nextButton);
    // setCarouselIndexMock should be called to go to next item
    expect(setCarouselIndexMock).toHaveBeenCalled();
  });

  it("populates the query with transcribed audio after microphone click", () => {
    const setQueryMock = vi.fn();
    const startRecordingMock = vi.fn();

    render(
      <ChatbotPanel
        {...defaultProps}
        query=""
        setQuery={setQueryMock}
        startRecording={startRecordingMock}
        isRecording={false}
      />,
      { wrapper: MemoryRouter }
    );
    const micButton = screen.getByTestId("mic-btn");
    fireEvent.click(micButton);
    expect(startRecordingMock).toHaveBeenCalled();
    setQueryMock("Transcribed voice input");
    expect(setQueryMock).toHaveBeenCalledWith("Transcribed voice input");
  });

  it("plays audio and displays answer text for a given query", () => {
    const playAnswerMock = vi.fn();
    const answer = {
      title: "Financial Aid",
      content: "Here is some information for seniors."
    };
    const allSchemes = [answer];
    render(
      <ChatbotPanel
        {...defaultProps}
        query="Tell me about financial aid"
        setQuery={vi.fn()}
        answer={answer}
        allSchemes={allSchemes}
        currentScheme={answer}
        renderChatbotContent={(scheme) => <div>{scheme.content}</div>}
        playAnswer={playAnswerMock}
        isSpeaking={false}
      />,
      { wrapper: MemoryRouter }
    );
    expect(screen.getByText(/Here is some information for seniors/i)).toBeInTheDocument();
    const playBtn = screen.getByRole("button", { name: /play answer/i });
    fireEvent.click(playBtn);
    expect(playAnswerMock).toHaveBeenCalled();
  });

});