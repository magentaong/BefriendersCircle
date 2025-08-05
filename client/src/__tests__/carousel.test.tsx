import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

// Mock hooks and any related modules
let mockResources: any[] = [];
let mockCategories: string[] = [];
let mockError = "";
let mockLoading = false;

vi.mock("../hooks/useResourceChat", () => ({
  useResourceChat: () => ({
    resources: mockResources,
    categories: mockCategories,
    loading: mockLoading,
    error: mockError,
    refetch: vi.fn(),
  }),
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

// Mock useCarousel hook with internal state to simulate carousel behavior
vi.mock("../hooks/useCarousel", () => {
  const React = require("react");
  return {
    useCarousel: (items: any[], itemsPerGroup: number = 4) => {
      const [index, setIndex] = React.useState(0);
      // Group the items into chunks of size itemsPerGroup
      const groupedItems: any[][] = [];
      for (let i = 0; i < items.length; i += itemsPerGroup) {
        groupedItems.push(items.slice(i, i + itemsPerGroup));
      }
      const totalGroups = groupedItems.length;
      const scrollLeft = () => {
        setIndex((prevIndex) => (prevIndex === 0 ? totalGroups - 1 : prevIndex - 1));
      };
      const scrollRight = () => {
        setIndex((prevIndex) => (prevIndex === totalGroups - 1 ? 0 : prevIndex + 1));
      };
      const updateCarouselIndex = (newIndex: number) => {
        setIndex(newIndex);
      };
      const getIndexForTab = () => 0;
      const getProgress = () => index;
      return {
        // Expose functions and any needed values for the carousel
        scrollLeft,
        scrollRight,
        updateCarouselIndex,
        getIndexForTab,
        getProgress,
        groupedItems,
        currentIndex: index,
      };
    },
  };
});

// Import component under test after mocks
import ResourceLibrary from "../pages/Resources";

describe("<TagsCarousel /> on Resources page", () => {
  beforeEach(() => {
    // Set up default mock data: one category with many tags to enable carousel
    mockCategories = ["Chatbot", "TestCat"];
    mockResources = [
      {
        _id: "test1",
        title: "Test Resource",
        description: "Resource with many tags for carousel",
        category: "TestCat",
        tags: ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5", "Tag6", "Tag7", "Tag8"],
        link: "#",
        eligibility: ["N/A"],
        steps: ["Step 1"],
      },
    ];
    mockLoading = false;
    mockError = "";
    vi.clearAllMocks();
  });

  it("displays the first group of tags by default (index 0) with correct progress indicator", () => {
    render(<ResourceLibrary />, { wrapper: MemoryRouter });
    // Initially, the "Chatbot" tab is active; switch to the TestCat category to show the carousel
    fireEvent.click(screen.getByText("TestCat"));
    // Verify that the first group of tags (index 0) is displayed
    expect(screen.getByText("Tag1 (1)")).toBeInTheDocument();
    expect(screen.getByText("Tag2 (1)")).toBeInTheDocument();
    expect(screen.getByText("Tag3 (1)")).toBeInTheDocument();
    expect(screen.getByText("Tag4 (1)")).toBeInTheDocument();
    // Tags from the next group should not yet be visible
    expect(screen.queryByText("Tag5 (1)")).not.toBeInTheDocument();
    // Progress indicator (dots) should reflect we are on the first group (first dot active)
    const indicators = screen.getAllByText(/●|○/); // Assuming filled (●) for active, outline (○) for inactive
    expect(indicators.length).toBe(2); // There should be 2 dots for 2 groups of tags
    expect(indicators[0].textContent).toBe("●"); // first dot is active
    expect(indicators[1].textContent).toBe("○"); // second dot is inactive
  });

  it("moves to the next group of tags when the right arrow is clicked", () => {
    render(<ResourceLibrary />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByText("TestCat"));
    // Click the right arrow to go to the next group
    fireEvent.click(screen.getByAltText(/right arrow/i));
    // Now the second (last) group of tags should be displayed
    expect(screen.getByText("Tag5 (1)")).toBeInTheDocument();
    expect(screen.getByText("Tag6 (1)")).toBeInTheDocument();
    expect(screen.getByText("Tag7 (1)")).toBeInTheDocument();
    expect(screen.getByText("Tag8 (1)")).toBeInTheDocument();
    // The first group's tags should no longer be visible
    expect(screen.queryByText("Tag1 (1)")).not.toBeInTheDocument();
    // Progress indicator should update (second dot becomes active)
    const indicators = screen.getAllByText(/●|○/);
    expect(indicators.length).toBe(2);
    expect(indicators[0].textContent).toBe("○"); // first dot now inactive
    expect(indicators[1].textContent).toBe("●"); // second dot now active
  });

  it("cycles back to the last group when the left arrow is clicked on the first group", () => {
    render(<ResourceLibrary />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByText("TestCat"));
    // Click the left arrow while on the first group (index 0) to wrap around to the last group
    fireEvent.click(screen.getByAltText(/left arrow/i));
    // The last group of tags should now be displayed (wrap-around from first to last)
    expect(screen.getByText("Tag5 (1)")).toBeInTheDocument();
    expect(screen.getByText("Tag8 (1)")).toBeInTheDocument();
    expect(screen.queryByText("Tag1 (1)")).not.toBeInTheDocument();
    // Progress indicator should show last dot as active
    const indicators = screen.getAllByText(/●|○/);
    expect(indicators.length).toBe(2);
    expect(indicators[0].textContent).toBe("○");
    expect(indicators[1].textContent).toBe("●");
  });
});
