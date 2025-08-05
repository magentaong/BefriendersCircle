import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { createTraining, updateTraining, getTraining } from "../api/simulation";
import SceneTextButton from "../components/training/SceneTextButton";
import HomeSafetyScene from "../scenes/HomeSafetyScene";
import animationData from "../content/HomeSafety.json";

export default function HomeSafetyLesson() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<"start" | "camera" | "question" | "response" | "transitioning" | "complete">("start");
  const [score, setScore] = useState(0);
  const [selectedAnimation, setSelectedAnimation] = useState<string[] | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [optionsDisabled, setOptionsDisabled] = useState(false);

  // for current TID
  const [tID, setTID] = useState<string | null>(null);

  const currentItem = animationData.scenes[currentIndex];

  const handleStart = async () => {
    setStage("camera");

    const cID = localStorage.getItem("cID");
    if (!cID) {
      console.error("cID not found in localStorage");
      return;
    }

    const tID = `${cID}-home-safety`;
    setTID(tID);

    try {
      const training = await getTraining(cID, "Home Safety Simulation");
      const resumeIndex = training?.progress ?? 0;
      const currentStatus = training?.status ?? false;

      console.log("Resume index:", resumeIndex, "Status:", currentStatus);

      // If simulation completed before, assume user wants to retru and reset progress to 0 / update backend
      if (currentStatus === true) {
        setCurrentIndex(0);

        try {
          await updateTraining(tID, 0, false);
          console.log("Simulation status reset to incomplete and progress set to 0.");
        } catch (updateErr) {
          console.error("Failed to reset simulation status:", updateErr);
        }
      } else {
        // Resume from saved progress
        setCurrentIndex(resumeIndex);
      }

    } catch (err: any) {
      if (err.response?.status === 404) {
        try {
          const data = await createTraining(tID, cID, "Home Safety Simulation");
          console.log(data.message || "Training created:", data.training || data);
          setCurrentIndex(0);
        } catch (createErr) {
          console.error("Failed to create training session:", createErr);
        }
      } else {
        console.error("Failed to fetch training:", err);
      }
    }
  };

  const handleEnd = async () => {
    if (!tID) return;
    try {
      const updatedTraining = await updateTraining(tID, 12, true);
      console.log("Training updated:", updatedTraining);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCameraComplete = () => {
    setStage("question");
  };

  const handleOptionClick = async (isCorrect: boolean, optionIndex: string) => {
    if (optionsDisabled) return; // this prevents double clicks now that its an api call lol (technically redundant but i lazy change oops)
    setOptionsDisabled(true);

    const idx = parseInt(optionIndex);
    const response = currentItem.options[idx];
    if (!response) return;

    setSelectedOptionIndex(idx);
    setSelectedAnimation(response.animation);
    setStage("response");

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    if (tID) {
      try {
        await updateTraining(tID, currentIndex + 1, false);
      } catch (err) {
        console.error("Failed to update progress:", err);
      }
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (currentIndex + 1 < animationData.scenes.length) {
        setStage("transitioning");
        setSelectedAnimation(null);
        setSelectedOptionIndex(null);
        setOptionsDisabled(false);

        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
          setStage("camera");
        }, 0);

      } else {
        setStage("complete");
      }
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <main className="bg-white min-h-screen flex flex-col w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center w-full sticky top-0 bg-white z-10 py-4 px-2 md:px-4 mb-2">
        <Link to="/training">
          <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-serene flex items-center justify-center mr-3 md:mr-4">
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </Link>
        <h1 className="text-sm md:text-base font-bold bg-serene px-3 md:px-4 py-2 rounded-xl text-center flex-grow">
          Home Safety Simulation
        </h1>
      </div>

      {/* Simulation */}
      <div className="flex-1 flex flex-col items-center w-full px-2 pb-4">
        <div className="w-full bg-serene rounded-xl overflow-hidden shadow-lg flex items-center justify-center min-h-[50vh] md:min-h-[400px] max-h-[70vh] my-4 p-4 md:p-8">
          <div className="w-full h-full">
            <HomeSafetyScene
              activeAnimation={selectedAnimation}
              cameraAnimation={stage === "camera" ? currentItem.cameraAnimation : null}
              onAnimationFinished={handleCameraComplete}
            />
          </div>
        </div>

        {/* Start Button */}
        {stage === "start" && (
          <SceneTextButton
            title="Start Simulation"
            bg="bg-serene"
            onClick={handleStart}
            className="w-64"
          />
        )}

        {/* Question and Choices */}
        {stage === "question" && selectedAnimation === null && (
          <div className="w-full text-center">
            <p className="text-charcoal text-sm md:text-base mb-4">{currentItem.question}</p>
            <div className="flex justify-center gap-4 flex-wrap">
              {currentItem.options.map((option, idx) => (
                <SceneTextButton
                  key={idx}
                  title={option.text}
                  bg="bg-serene"
                  onClick={() => handleOptionClick(option.isCorrect, idx.toString())}
                  disabled={optionsDisabled}
                />
              ))}
            </div>
          </div>
        )}

        {/* Explanation */}
        {stage === "response" && selectedOptionIndex !== null && (
          <div className="text-charcoal text-sm md:text-base mt-4 text-center">
            <p>{currentItem.options[selectedOptionIndex].explanation}</p>
          </div>
        )}

        {/* Completion Message */}
        {stage === "complete" && (
          <div className="text-charcoal mt-4 w-full px-4">
            <div className="flex justify-between items-center w-full max-w-3xl mx-auto">
              <div>
                <p className="text-lg font-semibold">Simulation Complete!</p>
                <p className="text-base">
                  Your score: {score} / {animationData.scenes.length}
                </p>
              </div>
              <Link to="/training">
                <SceneTextButton
                  title="End Simulation"
                  bg="bg-serene"
                  onClick={handleEnd}
                  className="w-40 py-2"
                />
              </Link>
            </div>
          </div>
        )}


      </div>
    </main>
  );
}
