import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";

// Mutable values referenced by the mock:
let mockResources:any = [];
let mockCategories = ["Chatbot", "General"];
let mockError = "";
let mockLoading = false;

// Mock useResourceChat to always reference these variables:
vi.mock("../hooks/useResourceChat", () => ({
  useResourceChat: () => ({
    resources: mockResources,
    categories: mockCategories,
    loading: mockLoading,
    error: mockError,
    refetch: vi.fn(),
  }),
}));

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

    // Second click on cardTwo opens its link
    const windowOpen2 = vi.spyOn(window, "open").mockImplementation(() => null);
    fireEvent.click(cardTwo!);
    expect(windowOpen2).toHaveBeenCalledWith("https://example.com/two", "_blank");
    windowOpen2.mockRestore();
  });

  it("shows empty state when no resources are available for a category", () => {
    mockResources = [];
    mockCategories = ["Chatbot", "General"];
    render(<ResourceLibrary />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByText("General"));

    // Empty message and refresh button
    expect(screen.getByText(/No resources found/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Refresh Resources/i })).toBeInTheDocument();
  });

  it("does not show empty state on Chatbot tab, even if resources are empty", () => {
    mockResources = [];
    mockCategories = ["Chatbot", "General"];
    render(<ResourceLibrary />, { wrapper: MemoryRouter });

    // Should be on Chatbot tab by default if no resources are found
    expect(screen.queryByText(/No resources found/i)).not.toBeInTheDocument();
  });
});
