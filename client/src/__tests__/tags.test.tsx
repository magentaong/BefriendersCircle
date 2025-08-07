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

// Import component under test after mocks
import Resources from "../pages/Resources";
import { useResourceChat } from "../hooks/useResourceChat";

const mockResources = [
  {
    _id: "1",
    title: "Financial Aid for Seniors",
    description: "Government financial assistance programs for elderly citizens",
    category: "Financial",
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
    eligibility: ["Elig 1"],  // using "Elig 1" and "Step 1" for test verification
    steps: ["Step 1"],
  },
  {
    _id: "4",
    title: "Senior Education Programs",
    description: "Educational courses for seniors",
    category: "General",
    tags: ["support", "education"],
    link: "https://example.com/education",
    eligibility: ["Elig 2"],
    steps: ["Step 2"],
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

describe("<TagsPanel />", () => {
  it("renders all top-level tags (Chatbot, General, Medical, Financial)", () => {
    renderWithResourceChat({});
    // All top-level tags should be displayed with their icons
    mockCategories.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
      const button = screen.getByText(tag).closest("button");
      expect(button?.querySelector("svg")).toBeInTheDocument();
    });
    // The default selected tag (Chatbot) should have active styling
    expect(screen.getByText("Chatbot").closest("button")).toHaveClass("bg-[#c9e2d6]");
  });

  it("shows tag filters when category is selected and displays resource cards when specific tag is clicked", () => {
    renderWithResourceChat({});
    // Click on a top-level tag (category) to filter resources
    fireEvent.click(screen.getByText("General"));
    
    // After selecting "General", the Tags panel should display tags for the General category with correct counts
    // "support" tag is shared by two General resources, so it should show count 2
    expect(screen.getByText("support (2)")).toBeInTheDocument();
    // A tag unique to one resource (e.g., "community") should show count 1
    expect(screen.getByText("community (1)")).toBeInTheDocument();
    expect(screen.getByText("social (1)")).toBeInTheDocument();
    expect(screen.getByText("education (1)")).toBeInTheDocument();
    
    // Initially, no resource cards should be visible (only tag filters)
    expect(screen.queryByText("Community Support Groups")).not.toBeInTheDocument();
    expect(screen.queryByText("Senior Education Programs")).not.toBeInTheDocument();
    
    // Click on a specific tag to show filtered resources
    fireEvent.click(screen.getByText("support (2)"));
    
    // After clicking "support" tag, both resources with "support" tag should be shown
    expect(screen.getByText("Community Support Groups")).toBeInTheDocument();
    expect(screen.getByText("Senior Education Programs")).toBeInTheDocument();
    
    // Resources from other categories should not be visible
    expect(screen.queryByText("Healthcare Resources")).not.toBeInTheDocument();
    expect(screen.queryByText("Financial Aid for Seniors")).not.toBeInTheDocument();
  });

  it("removes tag filter when clicking tag again or using Clear", () => {
    renderWithResourceChat({});
    fireEvent.click(screen.getByText("General"));
    
    // Click on a specific tag in the Tags panel to filter within the General category
    const educationTag = screen.getByText("education (1)");
    fireEvent.click(educationTag);
    
    // After filtering by "education", only resources with that tag should be shown
    expect(screen.getByText("Senior Education Programs")).toBeInTheDocument();
    expect(screen.queryByText("Community Support Groups")).not.toBeInTheDocument();
    
    // Clicking the same tag again should remove the filter and hide resource cards
    fireEvent.click(educationTag);
    expect(screen.queryByText("Community Support Groups")).not.toBeInTheDocument();
    expect(screen.queryByText("Senior Education Programs")).not.toBeInTheDocument();
    
    // Filter again by the same tag to test the Clear button
    fireEvent.click(screen.getByText("education (1)"));
    expect(screen.getByText("Senior Education Programs")).toBeInTheDocument();
    
    // Click the "Clear" button to remove the tag filter
    fireEvent.click(screen.getByText("Clear"));
    
    // After clearing the filter, resource cards should be hidden again
    expect(screen.queryByText("Community Support Groups")).not.toBeInTheDocument();
    expect(screen.queryByText("Senior Education Programs")).not.toBeInTheDocument();
  });

  // Not needed
  // it("allows only one content card expanded at a time", () => {
  //   renderWithResourceChat({});
  //   fireEvent.click(screen.getByText("General"));
  //   // Expand the first resource card
  //   const firstCard = screen.getByText("Community Support Groups").closest("div");
  //   fireEvent.click(firstCard!);
  //   expect(screen.getByText("Elig 1")).toBeInTheDocument();
  //   expect(screen.getByText("Step 1")).toBeInTheDocument();
  //   // Expand the second resource card
  //   const secondCard = screen.getByText("Senior Education Programs").closest("div");
  //   fireEvent.click(secondCard!);
  //   expect(screen.getByText("Elig 2")).toBeInTheDocument();
  //   expect(screen.getByText("Step 2")).toBeInTheDocument();
  //   // The first card's content should collapse when the second card is expanded
  //   expect(screen.queryByText("Elig 1")).not.toBeInTheDocument();
  //   expect(screen.queryByText("Step 1")).not.toBeInTheDocument();
  // });
});
