import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

  return (
    <main className="bg-white text-charcoal flex flex-col items-center gap-4 w-full max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 min-h-screen">
      {/* Header with Logo and Profile */}
      <header className="flex justify-between items-center w-full mb-6 md:mb-8">
        <Link to="/">
          <img src="/ESC.svg" alt="BefriendersCircle Logo" className="h-10 w-10 md:h-12 md:w-12" />
        </Link>
        <h1 className="text-lg md:text-xl font-bold text-charcoal">Training Centre</h1>
        {isLoggedIn && (
          <Link to="/profile">
            <img src="/Avatar.png" alt="User Profile" className="h-8 w-8 md:h-10 md:w-10 rounded-full" />
          </Link>
        )}
      </header>

      {/* Navigation */}
      <div className="flex items-center justify-between w-full mb-4 md:mb-6">
        {/* Left Arrow */}
        <Link to="/resources">
          <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-pistachio shadow text-lg flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </Link>

        {/* Centered Title */}
        <h2 className="text-base md:text-lg font-bold bg-serene px-4 md:px-6 py-2 rounded-xl shadow text-center flex-grow mx-2 md:mx-4">
          Training Centre
        </h2>

        {/* Right Arrow */}
        <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow text-lg flex items-center justify-center opacity-0">
          <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>

      {/* Filter Tabs - Mobile Responsive */}
      <div className="flex flex-wrap gap-2 w-full justify-center mb-4 md:mb-6">
        <button className="px-3 md:px-4 py-2 rounded-full bg-serene text-sm font-semibold shadow">
          Home-Care
        </button>
        <button className="px-3 md:px-4 py-2 rounded-full bg-white text-sm font-semibold shadow">
          Medicine
        </button>
        <button className="px-3 md:px-4 py-2 rounded-full bg-white text-sm font-semibold shadow">
          Hygiene
        </button>
        <button className="px-3 md:px-4 py-2 rounded-full bg-white text-sm font-semibold shadow">
          Physical
        </button>
        <button className="px-3 md:px-4 py-2 rounded-full bg-white text-sm font-semibold shadow">
          Self-Care
        </button>
        <button className="px-3 md:px-4 py-2 rounded-full bg-white text-sm font-semibold shadow">
          Finance
        </button>
      </div>

      {/* Module Card Grid - Mobile Responsive */}
      <section className="w-full flex-1 flex flex-col items-center">
        <div className="bg-serene rounded-2xl p-4 md:p-6 w-full shadow">
          <h2 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-center">
            Home-Care Modules:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {modules.map((mod) => (
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
                <span className="font-medium text-sm md:text-base text-charcoal text-center">{mod.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}