import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { createTraining, updateTraining, getTraining } from "../api/simulation";
import SceneTextButton from "../components/training/SceneTextButton";
import HomeSafetyScene from "../scenes/HomeSafetyScene";
import animationData from "../content/HomeSafety.json";
import Navigation from '../components/Navigation';

export default function HomeSafetyLesson() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<"start" | "camera" | "question" | "response" | "transitioning" | "complete">("start");
  const [score, setScore] = useState(0);
  const [selectedAnimation, setSelectedAnimation] = useState<string[] | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [optionsDisabled, setOptionsDisabled] = useState(false);

  // using this to show api call difference
  const [welcomeMessage, setWelcomeMessage] = useState<string>("Loading...");
  const [hasLoaded, setHasLoaded] = useState(false);

  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

  // for current TID
  const [tID, setTID] = useState<string | null>(null);

  const currentItem = animationData.scenes[currentIndex];

  // moved api calls to happen on page load, so it can greet users
  useEffect(() => {
    const loadTraining = async () => {
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

        if (currentStatus === true) {
          await updateTraining(tID, 0, false);
          setCurrentIndex(0);
          setWelcomeMessage("Good luck!");
        } else {
          setCurrentIndex(resumeIndex);
          setWelcomeMessage("Let's pick up from where you left off!");
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          try {
            await createTraining(tID, cID, "Home Safety Simulation");
            setCurrentIndex(0);
            setWelcomeMessage("Good luck!");
          } catch (createErr) {
            console.error("Failed to create training session:", createErr);
          }
        } else {
          console.error("Failed to fetch training:", err);
        }
      }

      setHasLoaded(true);
    };

    loadTraining();
  }, []);


  const handleStart = () => {
    setStage("camera");
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
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <main className="bg-white text-gray-800 px-8 py-6 w-full max-w-5xl mx-auto">
      {/* Header with Logo and Profile */}
      <Navigation header={"Training Center"} />

      {/* Simulation Title */}
      <div className="flex items-center justify-between w-full gap-2 mb-4 md:mb-6">
        <Link to="/training">
          <button className="w-12 h-12 rounded-full bg-serene shadow text-lg flex items-center justify-center hover:scale-105"><ArrowLeft></ArrowLeft></button>
        </Link>
        <h1 className="w-full h-12 rounded-full bg-serene shadow text-lg flex items-center justify-center gap-2 md:text-lg font-bold text-charcoal">
          Home Safety Simulation
        </h1>
      </div>

      {/* Simulation */}
      <div className="flex-1 flex flex-col items-center w-full px-2 pb-4">
        <div className="relative w-full bg-serene rounded-xl overflow-hidden shadow-md flex items-center justify-center min-h-[400px] h-[50vh] md:h-[75vh] my-4 p-4 md:p-8 aspect-video">
          <div className="w-full h-full">
            <HomeSafetyScene
              activeAnimation={selectedAnimation}
              cameraAnimation={stage === "camera" ? currentItem.cameraAnimation : null}
              onAnimationFinished={handleCameraComplete}
            />
          </div>
        </div>

        {/* Start Button */}
        {stage === "start" && hasLoaded && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-center text-charcoal text-base">You are trying to ensure your home is safe for your elderly parent to live in with you. What will you check first?</p>
            <p className="text-center text-charcoal italic text-base">{welcomeMessage}</p>
            <SceneTextButton
              title="Start Simulation"
              bg="bg-serene"
              onClick={handleStart}
              className="w-32"
            />
          </div>
        )}

        {/* Question and Choices */}
        {stage === "question" && selectedAnimation === null && (
          <div className="w-full text-center">
            <p className="text-charcoal text-sm md:text-base mb-4">Q{currentIndex + 1}: {currentItem.question}</p>
            <div className="flex justify-center gap-2 flex-wrap">
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
