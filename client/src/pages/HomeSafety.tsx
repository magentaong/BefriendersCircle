import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import HomeSafetyScene from "../scenes/HomeSafetyScene";
import animationData from "../../public/models/HomeSafety.json";

export default function HomeSafetyLesson() {
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null);
  const [displayText, setDisplayText] = useState(
    "Text has not loaded."
  );

  const handleAnimationClick = (animationName: string, text: string) => {
    setCurrentAnimation(animationName);
    setDisplayText(text);
  };

  return (
    <main className="bg-white min-h-screen flex flex-col w-full max-w-4xl mx-auto">
      {/* Sticky Header with Back Arrow */}
      <div className="flex items-center w-full sticky top-0 bg-white z-10 py-3 md:py-4 px-4 md:px-6 mb-2">
        <Link to="/training">
          <button className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-serene flex items-center justify-center mr-3 md:mr-4">
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </Link>
        <h1 className="text-sm md:text-base font-bold bg-serene px-3 md:px-4 py-2 rounded-xl text-center flex-grow">
          Home Safety Simulation
        </h1>
      </div>

      {/* Display Text */}
      <div className="w-full max-w-lg mx-auto px-2 pb-2 text-charcoal text-center">
        <p className="text-sm md:text-base">{displayText}</p>
      </div>

      {/* Simulation */}
      <div className="flex-1 flex flex-col justify-center items-center w-full px-2 pb-4">
        <div className="w-full bg-serene rounded-xl overflow-hidden shadow-lg flex flex-col items-center justify-center min-h-[50vh] md:min-h-[400px] max-h-[70vh] my-4 p-4 md:p-8">
          <div className="w-full h-full grow">
            <HomeSafetyScene activeAnimation={currentAnimation} />
          </div>
        </div>
      </div>

      {/* Dynamic Buttons */}
      <div className="w-full flex justify-center gap-4 pb-6 flex-wrap">
        {animationData.map((item) => (
          <button
            key={item.id}
            className="w-64 bg-serene px-4 py-2 rounded shadow hover:bg-blue-300"
            onClick={() => handleAnimationClick(item.id, item.responseText)}
          >
            {item.buttonText}
          </button>
        ))}
      </div>
    </main>
  );
}
