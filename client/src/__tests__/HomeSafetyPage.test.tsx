import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import HomeSafetyPage from "../pages/HomeSafety.tsx";
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

// similar to backend logic of completedCount
let sceneRenderCount = 0;

// Mock HomeSafetyScene with immediate callback call -- reduce logic to just animationFinish callback
vi.mock("../scenes/HomeSafetyScene", () => ({
    default: ({ onAnimationFinished }: { onAnimationFinished: () => void }) => {
        // Simulate animation finishing
        setTimeout(() => {
            onAnimationFinished();
        }, 0);

        sceneRenderCount++;

        return <div data-testid={`mock-scene-${sceneRenderCount}`}>Mock Scene {sceneRenderCount}</div>;
    },
}));

// Mock API calls to database
vi.mock("../api/simulation", () => ({
    getTraining: vi.fn(() => Promise.resolve(null)),
    createTraining: vi.fn(() => Promise.resolve({ message: "created", training: {} })),
    updateTraining: vi.fn(() => Promise.resolve({ message: "updated" })),
}));

// Mock JSON content -- first two questions only
vi.mock("../content/HomeSafety.json", () => ({
    default: {
        scenes: [
            {
                id: "kitchen1",
                cameraAnimation: "Camera1",
                question:
                    "Your mum uses the kitchen often, but uses the wall to support herself while walking. Is this dustbin in a good spot?",
                options: [
                    {
                        text: "No, I will move it away from the entrance",
                        isCorrect: true,
                        explanation: "Exactly, it is important to keep walkways clear to reduce tripping hazards!",
                        animation: ["dustbinShift"],
                    },
                    {
                        text: "Yes, it is near the stove",
                        isCorrect: false,
                        explanation: "No, it is important to keep walkways clear to reduce tripping hazards!",
                        animation: ["dustbinShift"],
                    },
                ],
            },
            {
                id: "kitchen2",
                cameraAnimation: "Camera2",
                question:
                    "You usually leave your pet's bowl out for her, but is it safe to leave it here?",
                options: [
                    {
                        text: "Store the bowl when not in use",
                        isCorrect: true,
                        explanation: "Right, pet bowls can also be a tripping hazard for the elderly",
                        animation: ["dogbowlShift"],
                    },
                    {
                        text: "Leave it, my cat might need it",
                        isCorrect: false,
                        explanation: "No, pet bowls can also be a tripping hazard for the elderly.",
                        animation: ["dogbowlShift"],
                    },
                ],
            }
        ],
    },
}));

// Setup helper to start simulation and wait for question so we can skip all the steps later
const setup = async () => {
    (api.getTraining as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: "test-id",
        progress: 0,
        status: false,
    });

    render(<HomeSafetyPage />, { wrapper: MemoryRouter });

    const startButton = await screen.findByText(/Start Simulation/i);
    fireEvent.click(startButton);

    await waitFor(() => {
        expect(screen.getByText(/Your mum uses the kitchen often/i)).toBeInTheDocument()
    });
};

describe("<HomeSafety />", () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem("cID", "test-client-id");
        vi.clearAllMocks();
        sceneRenderCount = 0;
    });

    it("User clicks on start simulation button and hides the button", async () => {
        render(<HomeSafetyPage />, { wrapper: MemoryRouter });
        const startButton = await screen.findByText(/Start Simulation/i);
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(screen.queryByText(/Start Simulation/i)).not.toBeInTheDocument();
        });
    });


    it("User clicks on start simulation and sees the question and options", async () => {
        render(<HomeSafetyPage />, { wrapper: MemoryRouter });

        const startButton = await screen.findByText(/Start Simulation/i);
        fireEvent.click(startButton);

        await waitFor(() => {
            expect(api.getTraining).toHaveBeenCalledWith("test-client-id", "Home Safety Simulation");
        });

        await waitFor(() => {
            expect(screen.getByText(/Your mum uses the kitchen often/i)).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /No, I will move it away from the entrance/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /Yes, it is near the stove/i })).toBeInTheDocument();
        });
    });

    it("User clicks an option and disables buttons", async () => {
        await setup();

        fireEvent.click(screen.getByRole("button", { name: /No, I will move it away from the entrance/i }));

        await waitFor(() => {
            expect(screen.queryByText(/Your mum uses the kitchen often/i)).not.toBeInTheDocument();
            expect(screen.queryByRole("button", { name: /No, I will move it away from the entrance/i })).not.toBeInTheDocument();
            expect(screen.queryByRole("button", { name: /Yes, it is near the stove/i })).not.toBeInTheDocument();
        });
    });

    it("User clicks the correct option and sees correct explanation", async () => {
        await setup();

        fireEvent.click(screen.getByRole("button", { name: /No, I will move it away from the entrance/i }));

        await waitFor(() => {
            expect(screen.getByText(/Exactly, it is important to keep walkways clear to reduce tripping hazards!/i)).toBeInTheDocument();
        });
    });

    it("User clicks the wrong option and sees wrong explanation", async () => {
        await setup();

        fireEvent.click(screen.getByRole("button", { name: /Yes, it is near the stove/i }));

        await waitFor(() => {
            expect(screen.getByText(/No, it is important to keep walkways clear to reduce tripping hazards!/i)).toBeInTheDocument();
        });
    });

    it("User completes first question and progresses to the next", async () => {
        await setup();

        fireEvent.click(screen.getByRole("button", { name: /No, I will move it away from the entrance/i }));

        await waitFor(() => {
            expect(screen.getByText(/Exactly, it is important to keep walkways clear to reduce tripping hazards!/i)).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText(/You usually leave your pet's bowl out for her/i)).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /Leave it, my cat might need it/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /Store the bowl when not in use/i })).toBeInTheDocument();
        }, { timeout: 5000 });

    });

    it("User completes the last option for the sequence", async () => {
        await setup();

        fireEvent.click(screen.getByRole("button", { name: /No, I will move it away from the entrance/i }));

        await waitFor(() => {
            expect(screen.getByText(/Exactly, it is important to keep walkways clear to reduce tripping hazards!/i)).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText(/You usually leave your pet's bowl out for her/i)).toBeInTheDocument();
        }, { timeout: 5000 });

        fireEvent.click(screen.getByRole("button", { name: /Store the bowl when not in use/i }));

        await waitFor(() =>
            expect(screen.getByText(/Right, pet bowls can also be a tripping hazard for the elderly/i)).toBeInTheDocument()
        );

        await waitFor(() => {
            expect(screen.getByText(/End Simulation/i)).toBeInTheDocument()
        }, { timeout: 5000 });
    });

});
