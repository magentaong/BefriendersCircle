import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import PostsPage from "../pages/Topic";
import { waitFor } from "@testing-library/react";
import * as forumApi from "../api/forum";

// Mock DataBase
const posts = [
  { cID: "c_385", bID: "b_1013", createdAt: "2025-07-31T02:00:45.248+00:00", message: "Events are fun", comments: 45, likes: 2 },
  { cID: "c_146", bID: "b_1013", createdAt: "2025-07-25T17:21:20.468+00:00", message: "bye!", comments: 45, likes: 2 },
  { cID: "c_592", bID: "b_1014", createdAt: "2025-07-29T17:21:20.468+00:00", message: "I love my family!", comments: 7, likes: 8 },
  { cID: "c_814", bID: "b_1015", createdAt: "2025-07-22T17:21:20.468+00:00", message: "How to mangae money?", comments: 4, likes: 5 },
];

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
  initPost: vi.fn((category) => {
    if (category === "Family") {
      // Return posts that your component expects for "default"
      return Promise.resolve({ bID: "b_1013", posts: posts.filter(t => t.bID === "b_1013") });
    }
    // fallback: return empty or whatever matches category as bID
    return Promise.resolve({ bID: category, posts: posts.filter(t => t.bID === category) });
  }),
  postPost: vi.fn((cID, bID, message) => {
    posts.push({ cID, bID, createdAt:"7/9", message, comments:0, likes:0 });
    return Promise.resolve({ success: true });
  }),
  uploadImage: vi.fn((file) => Promise.resolve("mocked-image-url")),
}));

describe("<PostsPage />", async() => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('cID', 'cid_test');
    mockedNavigate.mockClear();
  });

  // render cause need to render yes. 
  it("Renders empty Post dashboard", async () => {
    render(<PostsPage />, { wrapper: MemoryRouter });
    // Check Add Button
    expect(screen.getByAltText("add"));

    // Check Board Title
    expect(await screen.getByText("default")).toBeInTheDocument();
    
    // Check text to notify user empty board
    expect(await screen.findByText("No post yet.")).toBeInTheDocument();
  });

  // render cause need to render yes. 
  it("Renders Post dashboard", async () => {
    render(
      <MemoryRouter initialEntries={["/posts/Family"]}>
        <Routes>
          <Route path="/posts/:currentCategory" element={<PostsPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByAltText("add"));
    await waitFor(() => {
      expect(screen.getByText("Family")).toBeInTheDocument();
    });
    // Check Individual Post (message and display time)
    expect(await screen.findByText("Events are fun")).toBeInTheDocument();
    expect(await screen.findByText("7/31/25, 10:00 am")).toBeInTheDocument();
    expect(await screen.findByText("bye!")).toBeInTheDocument();
    expect(await screen.findByText("7/26/25, 1:21 am")).toBeInTheDocument();
    expect(await screen.queryByText("I love my family!")).not.toBeInTheDocument();
    expect(await screen.queryByText("How to mangae money?")).not.toBeInTheDocument();
  });

  // 3 Test Case For Add button
  // Toggle to add popup when user clicks "Add"
  it("toggles to add Post Page", async() => {
    render(<PostsPage/>, { wrapper: MemoryRouter });

    //Check render Post Page (Same as render empty Post dashboard)
    expect(screen.getByAltText("add"));
    expect(await screen.getByText("default")).toBeInTheDocument();
    expect(await screen.findByText("No post yet.")).toBeInTheDocument();

    fireEvent.click(screen.getByAltText("add")); // click on add button
    // Add Page close button
    expect(screen.getByAltText("Close")).toBeInTheDocument();
    // Add Page Title
    expect(screen.getByText("Create new Post")).toBeInTheDocument();
    // Add Page query for Post message
    expect(screen.getByPlaceholderText("...")).toBeInTheDocument();
    // Add Page button
    expect(screen.getByText("Create")).toBeInTheDocument();
  });
    
  // Toggle back to forum when user clicks "close"
  it("toggles back to Post Page", async() => {
    render(<PostsPage/>, { wrapper: MemoryRouter });
    
    //Check render Post Page (Same as render empty Post dashboard)
    expect(screen.getByAltText("add"));
    expect(await screen.getByText("default")).toBeInTheDocument();
    expect(await screen.findByText("No post yet.")).toBeInTheDocument();

    fireEvent.click(screen.getByAltText("add")); // click on add button

    expect(screen.getByText("Create new Post")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("...")).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
    
    fireEvent.click(screen.getByAltText("Close")); // click on close button
    
    // Check return to Post Borad (Same as test case Render Post dashboard)
    expect(screen.getByAltText("add"));
    expect(await screen.getByText("default")).toBeInTheDocument();
    expect(await screen.findByText("No post yet.")).toBeInTheDocument();
  });
  
  it("creates a new Event post", async () => {
//Check render Post Page (Same as render empty Post dashboard)
    render(
      <MemoryRouter initialEntries={["/posts/Family"]}>
        <Routes>
          <Route path="/posts/:currentCategory" element={<PostsPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByAltText("add"));
    await waitFor(() => {
      expect(screen.getByText("Family")).toBeInTheDocument();
    });
    // Check Individual Post
    expect(await screen.findByText("Events are fun")).toBeInTheDocument();
    expect(await screen.findByText("bye!")).toBeInTheDocument();
    expect(await screen.queryByText("I love my family!")).not.toBeInTheDocument();
    expect(await screen.queryByText("How to mangae money?")).not.toBeInTheDocument();

    fireEvent.click(screen.getByAltText("add")); // click on add button

    // Check render Add Page (Same as the toggle to add Event Page)
    expect(screen.getByAltText("Close")).toBeInTheDocument();
    expect(screen.getByText("Create new Post")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("...")).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
    
    // Fill in the text input
    fireEvent.change(screen.getByPlaceholderText("..."), { 
      target: { value: "Testing Post...." } });

    // Click Post button
    fireEvent.click(screen.getByText("Create"));
    await waitFor(() => {
      expect(forumApi.postPost).toHaveBeenCalledWith(
        localStorage.getItem("cID"), "b_1013", "Testing Post....");
    });
      render(<PostsPage/>, {wrapper: MemoryRouter,});
      expect(await screen.getByText("Testing Post....")).toBeInTheDocument();
  });
  
      
});