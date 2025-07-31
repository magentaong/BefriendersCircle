import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import LoginPage from "../pages/Login.tsx";

// Mock navigation buttons
const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// Mock login and register API
vi.mock("../api/auth", () => ({
  login: vi.fn(() => Promise.resolve({ token: "fake-token", cID: "123", isOnboarded: true })),
  register: vi.fn(() => Promise.resolve({ token: "fake-token", cID: "456", isOnboarded: false })),
}));

describe("<LoginPage />", () => {
  beforeEach(() => {
    localStorage.clear();
    mockedNavigate.mockClear();
  });

  // render cause need to render yes. 
  it("Renders login form", () => {
    render(<LoginPage />, { wrapper: MemoryRouter });
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByText("Log In")).toBeInTheDocument();
  });

  // Toggle to resigter when user clicks "New here? Sign up"
  it("toggles to register", () => {
    render(<LoginPage />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByText("New here? Sign up"));
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();
  });

  // Toggle back to login when user clicks "Already have an account? Log In"
  it("toggles back to login", () => {
    render(<LoginPage />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByText("New here? Sign up"));
    fireEvent.click(screen.getByText("Already have an account? Log in"));
    expect(screen.queryByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByText("Log In")).toBeInTheDocument();
  });

  // Invliad email format, don't have '@'
  it("prevents login with invalid email", async () => {
    render(<LoginPage />, { wrapper: MemoryRouter });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "invalidemail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Log In"));

    const { login } = await import("../api/auth.ts");
    expect(login).not.toHaveBeenCalled();
  });

  // Incorrect password
  it("shows validation error for invalid password", async () => {
    render(<LoginPage />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByText("New here? Sign up"));

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "test" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Register"));

    await screen.findByText("Register");
    expect(localStorage.getItem("token")).toBe("fake-token");
    expect(mockedNavigate).toHaveBeenCalledWith("/onboarding");

    // simulate logout by clearing local storage 
    localStorage.clear(); 
    mockedNavigate.mockClear(); 

    const { login } = await import("../api/auth.ts");
    (login as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Invalid credentials"));
    // simulate logging in with wrong pass
    fireEvent.click(screen.getByText("Already have an account? Log in"));
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByText("Log In"));

    await screen.findByText("Invalid credentials"); 
    expect(mockedNavigate).not.toHaveBeenCalled();

  });
  
  // Incorrect email
  it("shows validation error for incorrect email", async () => {
    render(<LoginPage />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByText("New here? Sign up"));

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "test" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Register"));

    await screen.findByText("Register");
    expect(localStorage.getItem("token")).toBe("fake-token");
    expect(mockedNavigate).toHaveBeenCalledWith("/onboarding");

    // simulate logout by clearing local storage 
    localStorage.clear(); 
    mockedNavigate.mockClear(); 

    const { login } = await import("../api/auth.ts");
    (login as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("Invalid credentials"));
    // simulate logging in with wrong email
    fireEvent.click(screen.getByText("Already have an account? Log in"));
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test1@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Log In"));

    await screen.findByText("Invalid credentials"); 
    expect(mockedNavigate).not.toHaveBeenCalled();

  });

  // Sucessful Registration 
  it("registers successfully and redirects to onboarding", async () => {
    render(<LoginPage />, { wrapper: MemoryRouter });
    fireEvent.click(screen.getByText("New here? Sign up"));

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "test" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@email.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByText("Register"));

    await screen.findByText("Register"); 
    expect(localStorage.getItem("token")).toBe("fake-token");
    expect(mockedNavigate).toHaveBeenCalledWith("/onboarding");
  });

  // Sucessful Login
  it("logs in successfully and redirects based on if user is onboarded", async () => {
    render(<LoginPage />, { wrapper: MemoryRouter });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "magenta@gmail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Log In"));

    await screen.findByText("Log In"); 
    expect(localStorage.getItem("token")).toBe("fake-token");
    expect(mockedNavigate).toHaveBeenCalledWith("/");
  });
  
});
// TODO: Rewrite for cleaner tests if possible/ have time - mag