import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Home, Pill, Droplet, Dumbbell, Smile, DollarSign, FileText, } from "lucide-react";
import { useEffect, useState } from "react";
import Navigation from '../components/Navigation';
import { getTraining } from "../api/simulation";

const modules = [
  {
    title: "Home Safety",
    img: "/8.png",
    path: "/training/home-safety",
  }
];

const categories = ["Home-Care", "Medicine", "Hygiene", "Physical", "Self-care", "Finance"];

const categoryIcons: Record<string, React.ReactNode> = {
  "Home-Care": <Home size={22} />,
  "Medicine": <Pill size={22} />,
  "Hygiene": <Droplet size={22} />,
  "Physical": <Dumbbell size={22} />,
  "Self-Care": <Smile size={22} />,
  "Finance": <DollarSign size={22} />,
};

export default function Training() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

  const [activeTab, setActiveTab] = useState("Home-Care");

  const [moduleProgress, setModuleProgress] = useState<{ [key: string]: number }>({});

  // api call for module progress, same as in homeSafety
  useEffect(() => {
    const cID = localStorage.getItem("cID");
    if (!cID) return;

    const loadProgress = async () => {
      const progressMap: { [key: string]: number } = {};

      for (const mod of modules) {
        try {
          const training = await getTraining(cID, "Home Safety Simulation");
          progressMap[mod.title] = training?.progress ?? 0;
        } catch (err) {
          console.error(`Error fetching progress for ${mod.title}:`, err);
          progressMap[mod.title] = 0;
        }
      }

      setModuleProgress(progressMap);
    };

    loadProgress();
  }, [modules]);

  return (
    <main className="bg-white text-gray-800 px-8 py-6 w-full max-w-5xl mx-auto">
      {/* Header with Logo and Profile */}
      <Navigation header={"Training Center"} />

      {/* Navigation */}
      <div className="flex items-center justify-between w-full gap-2 mb-4 md:mb-6">
        {/* Left Arrow */}
        <Link to="/resources">
          <button className="w-12 h-12 rounded-full bg-pistachio shadow text-lg flex items-center justify-center hover:scale-105"><ArrowLeft></ArrowLeft></button>
        </Link>

        {/* Title Card */}
        <h1 className="w-full h-12 rounded-full bg-serene shadow text-lg flex items-center justify-center gap-2 md:text-lg font-bold text-charcoal">Training Centre</h1>

        {/* Right Arrow */}
        <Link to="/forum">
          <button className="w-12 h-12 rounded-full bg-blossom shadow text-lg flex items-center justify-center hover:scale-105"><ArrowRight></ArrowRight></button>
        </Link>
      </div>

      {/* Filter Tabs - Mobile Responsive */}
      <div className="flex flex-wrap gap-3 w-full justify-center my-4">
        {categories.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center justify-center gap-2 basis-[45%] sm:basis-[45%] md:basis-[30%] lg:flex-grow w-full sm:w-auto px-4 py-2 rounded-full shadow text-sm font-semibold hover:scale-105 transition
              ${activeTab === tab ? "bg-serene text-black" : "bg-gray-200 text-gray-700"}`}
          >
            {categoryIcons[tab] || <FileText size={22} />}
            <span className="capitalize">{tab.replace("-", " ")}</span>
          </button>
        ))}
      </div>

      {/* Module Card Grid - Mobile Responsive */}
      <section className="w-full flex-1 flex flex-col items-center">
        <div className="bg-serene rounded-2xl p-4 md:p-6 w-full shadow">
          <h2 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-center">
            {activeTab} Modules:
          </h2>

          {activeTab === "Home-Care" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {modules.map((mod) => {
                const rawProgress = moduleProgress[mod.title] ?? 0;
                const percent = Math.min((rawProgress / 12) * 100, 100); // cap at 100%

                return (
                  <Link
                    to={mod.path}
                    key={mod.title}
                    className="bg-white rounded-xl flex flex-col items-center justify-center p-4 md:p-6 min-h-[180px] md:min-h-[200px] shadow hover:scale-105 transition"
                  >
                    <img
                      src={mod.img}
                      alt={mod.title}
                      className="w-20 h-20 md:w-24 md:h-24 object-contain mb-2"
                      loading="lazy"
                    />
                    <span className="font-heading text-xl md:text-base text-charcoal text-center mb-2">
                      {mod.title}
                    </span>

                    <div className="w-full max-w-[160px] h-2 bg-gray-200 rounded-full overflow-hidden relative mt-2">
                      <div
                        role="progressbar"
                        className="h-full bg-serene transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-charcoal text-sm md:text-base py-8">
              Modules for <strong>{activeTab.replace("-", " ")}</strong> are coming soon.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}