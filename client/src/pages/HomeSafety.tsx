import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import HomeSafetyScene from "../scenes/HomeSafetyScene";

export default function HomeSafetyLesson() {
  return (
    <main className="bg-white min-h-screen flex flex-col w-full max-w-3xl mx-auto">
      {/* Sticky Header with Back Arrow */}
      <div className="flex items-center w-full sticky top-0 bg-white z-10 py-4 px-2 md:px-4 mb-2">
        <Link to="/training">
          <button className="w-10 h-10 rounded-full bg-serene flex items-center justify-center mr-4">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </Link>
        <h1 className="text-base md:text-lg font-bold bg-serene px-4 py-2 rounded-xl text-center flex-grow">
          Home Safety Simulation
        </h1>
      </div>

      {/* Simulation Placeholder */}
      <div className="flex-1 flex flex-col justify-center items-center w-full px-2 pb-4">
        <div className="w-full bg-serene rounded-xl overflow-hidden shadow-lg flex flex-col items-center justify-center min-h-[50vh] md:min-h-[400px] max-h-[70vh] my-4 p-4 md:p-8">
          <div className="w-full h-full grow">
            <HomeSafetyScene />
          </div>
        </div>
      </div>

      {/* Instructions or Description */}
      <div className="w-full max-w-lg mx-auto px-2 pb-6 text-charcoal text-center">
        <p className="text-sm md:text-base">
            Placeholder Text
        </p>
      </div>
    </main>
  );
}
