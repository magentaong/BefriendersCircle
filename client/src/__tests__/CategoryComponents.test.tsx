import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import CategoryPage from "../components/Forum/Category";

// Mock navigation buttons
const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// Mock forum API
vi.mock("../api/forum", () => ({
  initTopics: vi.fn((category) =>
  Promise.resolve([
    { name: "Fatigue", coverImg: "FatigueImage", category: "Events" },
    { name: "Family", coverImg: "FamilyImage", category: "Events" },
  ])
),

  postTopic: vi.fn(() => Promise.resolve({ success: true })),
  uploadImage: vi.fn(() => Promise.resolve("mocked-image-url")),
}));

describe("<CategoryPage />", async() => {
  beforeEach(() => {
    localStorage.clear();
    mockedNavigate.mockClear();
  });

  // render cause need to render yes. 
  it("Renders Events dashboard", async () => {
    render(<CategoryPage category="Events" header="Events" />, { wrapper: MemoryRouter });
    // Check Add Button
    expect(screen.getAllByAltText("add"));
    // Check Search Bar
    expect(screen.getByPlaceholderText("Search Events...")).toBeInTheDocument();
    // Check Board Title
    expect(screen.getByText("Events")).toBeInTheDocument();
    // Check Individual Category
    expect(await screen.findByText("Family")).toBeInTheDocument();
    expect(await screen.findByAltText("Family")).toBeInTheDocument();
  });

  // For Add button
  // Toggle to add popup when user clicks "Add"
    it("toggles to add Event Page", () => {
      render(<CategoryPage category="Events" header="Events"/>, { wrapper: MemoryRouter });
      fireEvent.click(screen.getByAltText("add")); // click on add button
      // Add Page Title
      expect(screen.getByText("Create new Events")).toBeInTheDocument();
      // Add Page query for Event Name
      expect(screen.getByText("Events Name:")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
      // Add Page query for Event Image
      expect(screen.getByText("Events Image:")).toBeInTheDocument();
      expect(screen.getByAltText("Add Image")).toBeInTheDocument();
      expect(screen.getByText("Add Image")).toBeInTheDocument();
      // Add Page button
      expect(screen.getByText("Post")).toBeInTheDocument();
    });

    // Toggle back to forum when user clicks "close"
      it("toggles back to Category Page", async() => {
        render(<CategoryPage category="Events" header="Events"/>, { wrapper: MemoryRouter });
        fireEvent.click(screen.getByAltText("add")); // click on add button
        
        // Check render Add Page (Same as the toggle to add Event Page)
        expect(screen.getByText("Create new Events")).toBeInTheDocument();
        expect(screen.getByText("Events Name:")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
        expect(screen.getByText("Events Image:")).toBeInTheDocument();
        expect(screen.getByAltText("Add Image")).toBeInTheDocument();
        expect(screen.getByText("Add Image")).toBeInTheDocument();
        expect(screen.getByText("Post")).toBeInTheDocument();

        // Check return to Event Borad (Same as test case Render Event dashboard)
        expect(screen.getAllByAltText("add"));
        expect(screen.getByPlaceholderText("Search Events...")).toBeInTheDocument();
        expect(screen.getByText("Events")).toBeInTheDocument();
        expect(await screen.findByText("Family")).toBeInTheDocument();
        expect(await screen.findByAltText("Family")).toBeInTheDocument();
        });
    
})