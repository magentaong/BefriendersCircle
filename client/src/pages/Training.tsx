import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

const modules = [
  {
    title: "Home Safety",
    img: "/8.png", 
    path: "/training/home-safety",
  },
  {
    title: "Fire Safety",
    img: "/9.png",
    path: "#",
  },
  {
    title: "Caregiving Resources",
    img: "/10.png",
    path: "#",
  },
  {
    title: "Accident Prevention",
    img: "/11.png",
    path: "#",
  },
];

export default function Training() {
  return (
    <main className="bg-white text-gray-800 flex flex-col items-center gap-4 w-full max-w-6xl md:max-w-xl md:p-10 min-h-screen">
      <Navigation />

      {/* Tabs & Navigation */}
      <div className="flex items-center justify-between w-full mt-2">
        {/* Left Arrow */}
        <Link to="/resources">
          <button className="w-12 h-12 rounded-full bg-pistachio shadow text-lg flex items-center justify-center">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </Link>

        {/* Centered Title */}
        <h1 className="text-lg font-bold bg-serene px-6 py-2 rounded-xl shadow text-center flex-grow mx-4">
          Training Centre
        </h1>

        {/* Right Arrow */}
        <button className="w-12 h-12 rounded-full bg-white shadow text-lg flex items-center justify-center opacity-0">
          {/* Empty right button for spacing (or add link if carousel/more pages) */}
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 w-full justify-center my-2">
        <button className="px-4 py-2 rounded-full bg-serene text-sm font-semibold shadow">
          Home-Care
        </button>
        <button className="px-4 py-2 rounded-full bg-white text-sm font-semibold shadow">
          Medicine
        </button>
        <button className="px-4 py-2 rounded-full bg-white text-sm font-semibold shadow">
          Hygiene
        </button>
        <button className="px-4 py-2 rounded-full bg-white text-sm font-semibold shadow">
          Physical
        </button>
        <button className="px-4 py-2 rounded-full bg-white text-sm font-semibold shadow">
          Self-Care
        </button>
        <button className="px-4 py-2 rounded-full bg-white text-sm font-semibold shadow">
          Finance
        </button>
      </div>

      {/* Module Card Grid */}
      <section className="w-full flex-1 flex flex-col items-center">
        <div className="bg-serene rounded-2xl p-4 w-full shadow">
          <h2 className="text-base md:text-lg font-bold mb-3 text-center">
            Home-Care Modules:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {modules.map((mod) => (
              <Link
                to={mod.path}
                key={mod.title}
                className="bg-white rounded-xl flex flex-col items-center justify-center p-6 min-h-[220px] min-w-[180px] shadow hover:scale-105 transition"
              >
                <img
                  src={mod.img}
                  alt={mod.title}
                  className="w-32 h-32 sm:w-40 sm:h-40 object-contain mb-2"
                  loading="lazy"
                />
                <span className="font-medium text-base text-charcoal">{mod.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}