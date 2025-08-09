import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

// Mutable values referenced by the mock setup
let mockResources:any = [];
let mockCategories = ["Chatbot", "General"];
let mockError = "";
let mockLoading = false;

// Mock for useResourceChat hook to return the mutable values above
vi.mock("../hooks/useResourceChat", () => ({
  useResourceChat: () => ({
    resources: mockResources,
    categories: mockCategories,
    loading: mockLoading,
    error: mockError,
    refetch: vi.fn(),
  }),
}));

// Import component being tested 
import ResourceLibrary from "../pages/Resources";

describe("<ResourceLibrary /> Resource Cards - Multiple & Empty (vi.mock)", () => {
  afterEach(() => {
    // Reset mocks for each test so data doesn't leak between them
    mockResources = [];
    mockCategories = ["Chatbot", "General"];
    mockError = "";
    mockLoading = false;
    vi.clearAllMocks();
  });

  // Helper function to generate n mock resources with sequential numbering
  // Cycles through 3 variations
  function fillResources(n: number) {
    mockResources = Array.from({ length: n }).map((_, idx) => ({
      _id: String(idx + 1),
      title: `Resource ${idx + 1}`,
      description: `Desc ${idx + 1}`,
      category: "General",
      eligibility: [`Elig ${idx + 1}`],
      steps: [`Step ${idx + 1}`],
      tags: [`tag${(idx % 3) + 1}`],
    }));
  }

  // Set up mock data
  it("renders multiple resource cards, expands each independently", () => {
    mockResources = [
      {
        _id: "1",
        title: "Resource One",
        description: "Description One",
        category: "General",
        tags: ["tag1"],
        link: "https://example.com/one",
        eligibility: ["Elig 1"],
        steps: ["Step 1"],
      },
      {
        _id: "2",
        title: "Resource Two",
        description: "Description Two",
        category: "General",
        tags: ["tag2"],
        link: "https://example.com/two",
        eligibility: ["Elig 2"],
        steps: ["Step 2"],
      },
    ];
    render(<ResourceLibrary />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByText("General"));

    // Both resource cards should appear
    expect(screen.getByText("Resource One")).toBeInTheDocument();
    expect(screen.getByText("Resource Two")).toBeInTheDocument();

    // Expand first card, check content
    const cardOne = screen.getByText("Resource One").closest("div");
    fireEvent.click(cardOne!);
    expect(screen.getByText("Elig 1")).toBeInTheDocument();
    expect(screen.getByText("Step 1")).toBeInTheDocument();

    // Expand second card, check content
    const cardTwo = screen.getByText("Resource Two").closest("div");
    fireEvent.click(cardTwo!);
    expect(screen.getByText("Elig 2")).toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();

    // Second click on already-expanded card to open link
    const windowOpen2 = vi.spyOn(window, "open").mockImplementation(() => null);
    fireEvent.click(cardTwo!);
    expect(windowOpen2).toHaveBeenCalledWith("https://example.com/two", "_blank");
    windowOpen2.mockRestore();
  });

  // Checked for empty state when no resources are available (specifically for General)
  it("shows empty state when no resources are available for a category", () => {
    mockResources = [];
    mockCategories = ["Chatbot", "General"];
    render(<ResourceLibrary />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByText("General"));

    // Empty message and refresh button
    expect(screen.getByText(/No resources found/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Refresh Resources/i })).toBeInTheDocument();
  });

  // Checked for non-empty state on Chatbot tab, as it does not exist even 
  it("does not show empty state on Chatbot tab, even if resources are empty", () => {
    mockResources = [];
    mockCategories = ["Chatbot", "General"];
    render(<ResourceLibrary />, { wrapper: MemoryRouter });

    // Should be on Chatbot tab by default if no resources are found
    expect(screen.queryByText(/No resources found/i)).not.toBeInTheDocument();
  });

  // Set up for 7 resources, checked for carousel pagination (specifically on General tab)
  it("shows only 3 resource cards at once, moves right/left by 3", () => {
    fillResources(7);

    render(<ResourceLibrary />, { wrapper: MemoryRouter });

    // Checks for whether resource cards are present or not based on the page visited

    fireEvent.click(screen.getByText("General"));
    const rightChevron = screen.getByLabelText("carousel-right");
    const leftChevron = screen.getByLabelText("carousel-left");

    // Page 1
    expect(screen.getByText("Resource 1")).toBeInTheDocument();
    expect(screen.getByText("Resource 2")).toBeInTheDocument();
    expect(screen.getByText("Resource 3")).toBeInTheDocument();
    expect(screen.queryByText("Resource 4")).not.toBeInTheDocument();

    // Click right
    
    fireEvent.click(rightChevron);

    // Page 2
    expect(screen.getByText("Resource 4")).toBeInTheDocument();
    expect(screen.getByText("Resource 5")).toBeInTheDocument();
    expect(screen.getByText("Resource 6")).toBeInTheDocument();
    expect(screen.queryByText("Resource 1")).not.toBeInTheDocument();

    // Click right again
    fireEvent.click(rightChevron);

    // Page 3
    expect(screen.getByText("Resource 7")).toBeInTheDocument();
    expect(screen.queryByText("Resource 4")).not.toBeInTheDocument();
    expect(screen.queryByText("Resource 1")).not.toBeInTheDocument();

    // Click left to go back
    fireEvent.click(leftChevron);

    // Page 2 again
    expect(screen.getByText("Resource 4")).toBeInTheDocument();
    expect(screen.getByText("Resource 5")).toBeInTheDocument();
    expect(screen.getByText("Resource 6")).toBeInTheDocument();
    expect(screen.queryByText("Resource 7")).not.toBeInTheDocument();
  });

  // Checked for progress bar update, tests for specific width as there are 7 resources 
  it("progress bar updates as carousel moves", () => {
    fillResources(7); // 3 groups: (3, 3, 1)
    render(<ResourceLibrary />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByText("General"));
    const rightChevron = screen.getByLabelText("carousel-right");

    // At first group: progress bar should be at 1/3 
    let bar = screen.getByRole("progressbar");
    expect(bar).toHaveStyle({ width: "33.33333333333333%"});

    // Move to second group
    fireEvent.click(rightChevron);
    bar = screen.getByRole("progressbar");
    expect(bar).toHaveStyle({width: "66.66666666666666%"});

    // Move to third group
    fireEvent.click(rightChevron);
    bar = screen.getByRole("progressbar");
    expect(bar).toHaveStyle({width: "100%"});
  });
});
