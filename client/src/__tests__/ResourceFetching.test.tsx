import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
    categories: ["Chatbot"],
    loading: false,
    error: "",
    refetch: vi.fn(),
  }),
}));

import Resources from "../pages/Resources";

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

describe("<ResourceLibrary /> behavior", () => {
  it("updates the chatbot input as user types", () => {
    render(<Resources />, { wrapper: MemoryRouter });
    const input = screen.getByPlaceholderText(/what financial subsidies do you recommend for seniors\?/i);
    fireEvent.change(input, { target: { value: "test message" } });
    expect(input).toHaveValue("test message");
  });

  it("triggers fetchResponse when the search button is clicked", () => {
    render(<Resources />, { wrapper: MemoryRouter });
    const searchButton = screen.getByTitle("Search");
    fireEvent.click(searchButton);
    expect(fetchResponseMock).toHaveBeenCalled();
  });

  it("displays an error message when error prop is set", () => {
    mockError = "Failed to fetch resources";
    render(<Resources />, { wrapper: MemoryRouter });
    expect(screen.getByText(/failed to fetch resources/i)).toBeInTheDocument();
  });

  it("navigates to /forum and /training when arrow buttons are clicked", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Resources />
      </MemoryRouter>
    );
    // Find left and right arrow buttons (by accessible label, testId, or order)
    const [leftButton, rightButton] = screen.getAllByRole("button");

    // Left button is /forum, right is /training
    expect(leftButton.closest("a")).toHaveAttribute("href", "/forum");
    expect(rightButton.closest("a")).toHaveAttribute("href", "/training");
  });
});
