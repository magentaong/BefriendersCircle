import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import CategoryPage from "../components/Forum/Category";
import { waitFor } from "@testing-library/react";
import * as forumApi from "../api/forum";

// Mock navigation buttons
const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// Mock DataBase
const topics = [
  { name: "Fatigue", coverImg: "FatigueImage", category: "Events" },
  { name: "Family", coverImg: "FamilyImage", category: "Events" },
  { name: "Christmas", coverImg: "ChristmasImage", category: "Topics" },
];

// Mock forum API
vi.mock("../api/forum", () => ({
  initTopics: vi.fn((category) => Promise.resolve(topics.filter(t => t.category === category))),
  postTopic: vi.fn((cID, category, name, coverImg) => {
    topics.push({ name, coverImg, category });
    return Promise.resolve({ success: true });
  }),
  uploadImage: vi.fn((file) => Promise.resolve("mocked-image-url")),
}));

describe("<CategoryPage />", async() => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('cID', 'cid_test');
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
    expect(await screen.findByText("Fatigue")).toBeInTheDocument();
    expect(await screen.findByAltText("Fatigue")).toBeInTheDocument();
    expect(screen.queryByText("Christmas")).not.toBeInTheDocument();
  });

  // render cause need to render yes. 
  it("Has been click and goes to the post dashboard", async () => {
    render(<CategoryPage category="Events" header="Events" />, { wrapper: MemoryRouter });
    expect(screen.getAllByAltText("add"));
    expect(screen.getByPlaceholderText("Search Events...")).toBeInTheDocument();
    expect(screen.getByText("Events")).toBeInTheDocument();
    expect(await screen.findByText("Family")).toBeInTheDocument();
    expect(await screen.findByAltText("Family")).toBeInTheDocument();
    expect(await screen.findByText("Fatigue")).toBeInTheDocument();
    expect(await screen.findByAltText("Fatigue")).toBeInTheDocument();
    expect(screen.queryByText("Christmas")).not.toBeInTheDocument();

    fireEvent.click(screen.getByAltText("Family"));
    expect(mockedNavigate).toHaveBeenCalledWith("./Family");
  });

  // 3 Test Case For Add button
  // Toggle to add popup when user clicks "Add"
    it("toggles to add Event Page", () => {
      render(<CategoryPage category="Events" header="Events"/>, { wrapper: MemoryRouter });
      fireEvent.click(screen.getByAltText("add")); // click on add button
      // Add Page Close button
      expect(screen.getByAltText("Close")).toBeInTheDocument();
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
        expect(screen.getByAltText("Close")).toBeInTheDocument();
        expect(screen.getByText("Create new Events")).toBeInTheDocument();
        expect(screen.getByText("Events Name:")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
        expect(screen.getByText("Events Image:")).toBeInTheDocument();
        expect(screen.getByAltText("Add Image")).toBeInTheDocument();
        expect(screen.getByText("Add Image")).toBeInTheDocument();
        expect(screen.getByText("Post")).toBeInTheDocument();

        fireEvent.click(screen.getByAltText("Close")); // click on close button
        
        // Check return to Event Borad (Same as test case Render Event dashboard)
        expect(screen.getAllByAltText("add"));
        expect(screen.getByPlaceholderText("Search Events...")).toBeInTheDocument();
        expect(screen.getByText("Events")).toBeInTheDocument();
        expect(await screen.findByText("Family")).toBeInTheDocument();
        expect(await screen.findByAltText("Family")).toBeInTheDocument();
        });

      it("creates a new Event post", async () => {
        render(<CategoryPage category="Events" header="Events" />, {wrapper: MemoryRouter,});

        fireEvent.click(screen.getByAltText("add"));
        // Fill in the name input
        fireEvent.change(screen.getByPlaceholderText("Name"), { 
          target: { value: "Testing" } });

        // Mock image file
        const file = new File(["dummy"], "test.png", { type: "image/png" });

        // Upload image
        fireEvent.change(screen.getByTestId("image-input"), { 
          target: { files: [file] } });
        await waitFor(() => {
          expect(forumApi.uploadImage).toHaveBeenCalledWith(
            file);
        });

        // Click Post button
        fireEvent.click(screen.getByText("Post"));
        await waitFor(() => {
          expect(forumApi.postTopic).toHaveBeenCalledWith(
            localStorage.getItem("cID"), "Events", "Testing", "mocked-image-url");
        });
         render(<CategoryPage category="Events" header="Events" />, {wrapper: MemoryRouter,});
         expect(await screen.getByText("Testing")).toBeInTheDocument();
      });

      // 2 Test Case for Search Bar
      it("filters topics based on search input", async () => {
        render(<CategoryPage category="Events" header="Events" />, { wrapper: MemoryRouter });

        // Wait for topics to load
        expect(await screen.findByText("Family")).toBeInTheDocument();
        expect(screen.getByText("Fatigue")).toBeInTheDocument();

        // Get the search input
        const searchInput = screen.getByPlaceholderText("Search Events...");

        // Type into search box to filter topics
        fireEvent.change(searchInput, { target: { value: "Fam" } });

        // Now "Family" topic should be visible, but "Fatigue" should be filtered out
        // Wait for filtered results after debounce
        await waitFor(() => {
          expect(screen.getByText("Family")).toBeInTheDocument();
          expect(screen.queryByText("Fatigue")).not.toBeInTheDocument();
        });
        
      });

      it("filters topics based on search input and return to default board", async () => {
        render(<CategoryPage category="Events" header="Events" />, { wrapper: MemoryRouter });

        // Wait for topics to load
        expect(await screen.findByText("Family")).toBeInTheDocument();
        expect(screen.getByText("Fatigue")).toBeInTheDocument();

        // Get the search input
        const searchInput = screen.getByPlaceholderText("Search Events...");

        // Type into search box to filter topics
        fireEvent.change(searchInput, { target: { value: "Fam" } });

        // Now "Family" topic should be visible, but "Fatigue" should be filtered out
        // Wait for filtered results after debounce
        await waitFor(() => {
          expect(screen.getByText("Family")).toBeInTheDocument();
          expect(screen.queryByText("Fatigue")).not.toBeInTheDocument();
        });
        
        // Clear search to show all again
        fireEvent.change(searchInput, { target: { value: "" } });
        await waitFor(() => {
          expect(screen.getByText("Fatigue")).toBeInTheDocument();
          expect(screen.getByText("Family")).toBeInTheDocument();
        });
      });
    
})