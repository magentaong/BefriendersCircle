import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import TrainingPage from "../pages/Training.tsx";
import * as api from "../api/simulation";

// Mock navigation buttons (thanks mag <3)
const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

// Mock API calls to database
vi.mock("../api/simulation", () => ({
    getTraining: vi.fn(() => Promise.resolve(null)),
}));

describe("<Training />", () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem("cID", "test-client-id");
    });

    it("User enters training page and gets told their progress", async () => {
        render(<TrainingPage />, { wrapper: MemoryRouter });

        await waitFor(() => {
            expect(api.getTraining).toHaveBeenCalledWith("test-client-id", "Home Safety Simulation");
        });
    });

    it("User clicks a tag with no simulation created and sees warning message", async () => {
        render(<TrainingPage />, { wrapper: MemoryRouter });

        fireEvent.click(screen.getByText("Hygiene"));

        await waitFor(() => {
            expect(screen.getByText(/are coming soon./i)).toBeInTheDocument();
        });
    });
});