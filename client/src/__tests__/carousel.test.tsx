import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

// Mock hooks
vi.mock("../hooks/useResourceChat", () => ({
  useResourceChat: vi.fn(),
}));

vi.mock("../hooks/useChatbotAPI", () => ({
  useChatbotAPI: vi.fn(() => ({
    fetchResponse: vi.fn(),
    answer: null,
    setAnswer: vi.fn(),
    verifiedResource: null,
    relatedSchemes: [],
    error: "",
    setError: vi.fn(),
    loading: false,
    latency: false,
    initialLoad: false,
  })),
}));

vi.mock("../hooks/useTextToSpeech", () => ({
  useTextToSpeech: vi.fn(() => ({
    isSpeaking: false,
    playAnswer: vi.fn(),
  })),
}));

vi.mock("../hooks/useVoiceRecording", () => ({
  useVoiceRecording: vi.fn(() => ({
    isRecording: false,
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
  })),
}));

// Mock useCarousel hook to match actual implementation
vi.mock("../hooks/useCarousel", () => ({
  useCarousel: vi.fn(() => ({
    getIndexForTab: vi.fn(() => 0),
    updateCarouselIndex: vi.fn(),
    getGroupedItems: vi.fn(),
    scrollLeft: vi.fn(),
    scrollRight: vi.fn(),
    handleTouchStart: vi.fn(),
    handleTouchMove: vi.fn(),
    handleTouchEnd: vi.fn(),
    getProgress: vi.fn(() => 33.33), // Mock progress value
  })),
}));

// Import component under test after mocks
import Resources from "../pages/Resources";
import { useResourceChat } from "../hooks/useResourceChat";

const mockResources = [
  {
    _id: "1",
    title: "Resource 1",
    description: "First resource",
    category: "General",
    tags: ["tag1", "tag2"],
    link: "https://example.com/1",
    eligibility: ["Elig 1"],
    steps: ["Step 1"],
  },
  {
    _id: "2",
    title: "Resource 2",
    description: "Second resource",
    category: "General",
    tags: ["tag3", "tag4"],
    link: "https://example.com/2",
    eligibility: ["Elig 2"],
    steps: ["Step 2"],
  },
  {
    _id: "3",
    title: "Resource 3",
    description: "Third resource",
    category: "General",
    tags: ["tag5", "tag6"],
    link: "https://example.com/3",
    eligibility: ["Elig 3"],
    steps: ["Step 3"],
  },
  {
    _id: "4",
    title: "Resource 4",
    description: "Fourth resource",
    category: "General",
    tags: ["tag7", "tag8"],
    link: "https://example.com/4",
    eligibility: ["Elig 4"],
    steps: ["Step 4"],
  },
  {
    _id: "5",
    title: "Resource 5",
    description: "Fifth resource",
    category: "General",
    tags: ["tag9", "tag10"],
    link: "https://example.com/5",
    eligibility: ["Elig 5"],
    steps: ["Step 5"],
  },
  {
    _id: "6",
    title: "Resource 6",
    description: "Sixth resource",
    category: "General",
    tags: ["tag11", "tag12"],
    link: "https://example.com/6",
    eligibility: ["Elig 6"],
    steps: ["Step 6"],
  },
];

const mockCategories = ["Chatbot", "General", "Medical", "Financial"];
const mockUseResourceChat = vi.mocked(useResourceChat);

function renderWithResourceChat({
  resources = mockResources,
  categories = mockCategories,
  loading = false,
  error = "",
}) {
  mockUseResourceChat.mockReturnValue({
    resources,
    categories,
    loading,
    error,
    refetch: vi.fn(),
  });
  return render(<Resources />, { wrapper: MemoryRouter });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("<ResourceCarousel /> on Resources page", () => {
  it("displays carousel navigation buttons when resources are available", () => {
    renderWithResourceChat({});
    
    // Click on General category to show resources
    fireEvent.click(screen.getByText("General"));
    
    // Check that carousel navigation buttons are present
    expect(screen.getByLabelText("carousel-left")).toBeInTheDocument();
    expect(screen.getByLabelText("carousel-right")).toBeInTheDocument();
  });

  it("shows progress bar when resources are available", () => {
    renderWithResourceChat({});
    
    // Click on General category to show resources
    fireEvent.click(screen.getByText("General"));
    
    // Check that progress bar is present
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeInTheDocument();
  });

  it("displays resource cards in carousel format", () => {
    renderWithResourceChat({});
    
    // Click on General category to show resources
    fireEvent.click(screen.getByText("General"));
    
    // Check that resource cards are displayed
    expect(screen.getByText("Resource 1")).toBeInTheDocument();
    expect(screen.getByText("Resource 2")).toBeInTheDocument();
    expect(screen.getByText("Resource 3")).toBeInTheDocument();
  });

  it("handles carousel navigation button clicks", () => {
    renderWithResourceChat({});
    
    // Click on General category to show resources
    fireEvent.click(screen.getByText("General"));
    
    // Click left arrow
    fireEvent.click(screen.getByLabelText("carousel-left"));
    
    // Click right arrow
    fireEvent.click(screen.getByLabelText("carousel-right"));
    
    // Both clicks should not throw errors
    expect(screen.getByLabelText("carousel-left")).toBeInTheDocument();
    expect(screen.getByLabelText("carousel-right")).toBeInTheDocument();
  });

  it("shows empty state when no resources are available", () => {
    renderWithResourceChat({ resources: [] });
    
    // Click on General category
    fireEvent.click(screen.getByText("General"));
    
    // Should show empty state message
    expect(screen.getByText(/No resources found for/)).toBeInTheDocument();
    expect(screen.getByText("General", { selector: "strong" })).toBeInTheDocument();
  });
});
