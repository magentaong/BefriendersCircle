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
vi.mock("../hooks/useCarousel", () => ({
  useCarousel: vi.fn(() => ({
    getIndexForTab: vi.fn(),
    updateCarouselIndex: vi.fn(),
    getGroupedItems: vi.fn(),
    scrollLeft: vi.fn(),
    scrollRight: vi.fn(),
    handleTouchStart: vi.fn(),
    handleTouchMove: vi.fn(),
    handleTouchEnd: vi.fn(),
    getProgress: vi.fn(),
  })),
}));

// Mock window.open for link testing
const mockWindowOpen = vi.fn();
Object.defineProperty(window, "open", {
  value: mockWindowOpen,
  writable: true,
});

// Import after mocks
import Resources from "../pages/Resources";
import { useResourceChat } from "../hooks/useResourceChat";

const mockResources = [
  {
    _id: "1",
    title: "Financial Aid for Seniors",
    description: "Government financial assistance programs for elderly citizens",
    category: "Finance",
    tags: ["financial", "seniors", "government"],
    link: "https://example.com/financial-aid",
    eligibility: ["Age 65+", "Low income"],
    steps: ["Apply online", "Submit documents", "Wait for approval"],
  },
  {
    _id: "2",
    title: "Healthcare Resources",
    description: "Medical care and health services for seniors",
    category: "Medical",
    tags: ["healthcare", "medical", "seniors"],
    link: "https://example.com/healthcare",
    eligibility: ["All seniors"],
    steps: ["Find provider", "Schedule appointment"],
  },
  {
    _id: "3",
    title: "Community Support Groups",
    description: "Local support groups for seniors and caregivers",
    category: "General",
    tags: ["community", "support", "social"],
    link: "https://example.com/support-groups",
    eligibility: ["Open to all"],
    steps: ["Find group", "Contact organizer", "Attend meeting"],
  },
];

const mockCategories = ["Chatbot", "General", "Medical", "Finance"];
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
  mockWindowOpen.mockClear();
});

describe("<CategoryTabs />", () => {
  it("renders all category tabs with correct icons", () => {
    renderWithResourceChat({});
    mockCategories.forEach((cat) => {
      expect(screen.getByText(cat)).toBeInTheDocument();
      expect(
        screen.getByText(cat).closest("button")?.querySelector("svg")
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Chatbot").closest("button")).toHaveClass(
      "bg-[#c9e2d6]"
    );
  });

  it("handles category tab switching and styling", () => {
    renderWithResourceChat({});
    const [chatbot, general, medical, finance] = mockCategories.map((cat) =>
      screen.getByText(cat)
    );
    expect(chatbot.closest("button")).toHaveClass("bg-[#c9e2d6]");
    fireEvent.click(medical);
    expect(medical.closest("button")).toHaveClass("bg-[#c9e2d6]");
    expect(chatbot.closest("button")).not.toHaveClass("bg-[#c9e2d6]");
    fireEvent.click(finance);
    expect(finance.closest("button")).toHaveClass("bg-[#c9e2d6]");
    expect(medical.closest("button")).not.toHaveClass("bg-[#c9e2d6]");
  });

  it("filters resources by selected category", () => {
    renderWithResourceChat({});
    fireEvent.click(screen.getByText("Medical"));
    expect(screen.getByText("healthcare (1)")).toBeInTheDocument();
    expect(screen.getByText("medical (1)")).toBeInTheDocument();
    expect(screen.getByText("seniors (1)")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Finance"));
    expect(screen.getByText("financial (1)")).toBeInTheDocument();
    expect(screen.getByText("seniors (1)")).toBeInTheDocument();
    expect(screen.getByText("government (1)")).toBeInTheDocument();
  });

  it("shows empty state when no resources in category", () => {
    renderWithResourceChat({ resources: [] });
    fireEvent.click(screen.getByText("General"));
    expect(screen.getByText(/No resources found/i)).toBeInTheDocument();
  });

  it("maintains category state across rerenders and resource updates", () => {
    let currentResources = mockResources;
    let currentCategories = mockCategories;
    mockUseResourceChat.mockImplementation(() => ({
      resources: currentResources,
      categories: currentCategories,
      loading: false,
      error: "",
      refetch: vi.fn(),
    }));
    const { rerender } = render(<Resources />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByText("Medical"));
    rerender(<Resources />);
    expect(screen.getByText("Medical").closest("button")).toHaveClass(
      "bg-[#c9e2d6]"
    );
    // Update resources
    currentResources = [
      {
        _id: "4",
        title: "New Medical Resource",
        description: "New medical resource",
        category: "Medical",
        tags: ["new", "medical"],
        link: "https://example.com/new-medical",
        eligibility: ["New eligibility"],
        steps: ["New step"],
      },
    ];
    rerender(<Resources />);
    expect(screen.getByText("Medical").closest("button")).toHaveClass(
      "bg-[#c9e2d6]"
    );
    expect(screen.getByText("new (1)")).toBeInTheDocument();
    expect(screen.getByText("medical (1)")).toBeInTheDocument();
  });

  it("handles unknown categories gracefully", () => {
    const resourcesWithUnknownCategory = [
      {
        _id: "1",
        title: "Unknown Category Resource",
        description: "Resource with unknown category",
        category: "UnknownCategory",
        tags: ["unknown"],
        link: "https://example.com/unknown",
        eligibility: ["All"],
        steps: ["Step 1"],
      },
    ];
    renderWithResourceChat({
      resources: resourcesWithUnknownCategory,
      categories: ["Chatbot", "UnknownCategory"],
    });
    expect(screen.getByText("UnknownCategory")).toBeInTheDocument();
    fireEvent.click(screen.getByText("UnknownCategory"));
    expect(screen.getByText("unknown (1)")).toBeInTheDocument();
  });

  it("handles loading and error states", () => {
    renderWithResourceChat({ loading: true });
    mockCategories.forEach((cat) => expect(screen.getAllByText(cat)[0]).toBeInTheDocument());
    fireEvent.click(screen.getAllByText("Medical")[0]);
    expect(screen.getAllByText("Medical")[0].closest("button")).toHaveClass("bg-[#c9e2d6]");

    renderWithResourceChat({ error: "Failed to fetch resources" });
    mockCategories.forEach((cat) => expect(screen.getAllByText(cat)[0]).toBeInTheDocument());
    fireEvent.click(screen.getAllByText("Medical")[0]);
    expect(screen.getAllByText("Medical")[0].closest("button")).toHaveClass("bg-[#c9e2d6]");
  });

  it("handles empty and single category scenarios", () => {
    renderWithResourceChat({ categories: [] });
    expect(screen.getByText("Resource Library")).toBeInTheDocument();

    renderWithResourceChat({ categories: ["Chatbot"] });
    expect(screen.getByText("Chatbot")).toBeInTheDocument();
    expect(screen.queryByText("General")).not.toBeInTheDocument();
  });
});