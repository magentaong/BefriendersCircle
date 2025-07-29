import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import HomeSafetyScene from "../scenes/HomeSafetyScene";

export default function HomeSafetyLesson() {
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

      {/* Simulation Placeholder */}
      <div className="flex-1 flex flex-col justify-center items-center w-full px-4 md:px-6 pb-4 md:pb-6">
        <div className="w-full bg-serene rounded-xl overflow-hidden shadow-lg flex flex-col items-center justify-center min-h-[40vh] md:min-h-[50vh] max-h-[60vh] md:max-h-[70vh] my-4 p-3 md:p-4">
          <div className="w-full h-full grow">
            <HomeSafetyScene />
          </div>
        </div>
      </div>

      {/* Instructions or Description */}
      <div className="w-full px-4 md:px-6 pb-4 md:pb-6 text-charcoal text-center">
        <p className="text-xs md:text-sm">
            Placeholder Text
        </p>
      </div>
    </main>
  );
}
