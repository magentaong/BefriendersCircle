import { useNavigate } from "react-router-dom";
import { Mic, Search } from "lucide-react";
import CardBase from "../components/common/CardBase";

import elderlyImg from "/Community.png";     
import computerImg from "/Resources.png";
import breathingImg from "/Training.png";

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);
  
  return (
    <main className="w-full max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 md:mb-12">
        <img src="/ESC.svg" alt="BefriendersCircle Logo" className="h-12 w-12 md:h-16 md:w-16" />
        {isLoggedIn ? (
          <img
            src="/Avatar.png"
            alt="User Avatar"
            className="h-10 w-10 md:h-12 md:w-12 rounded-full cursor-pointer"
            onClick={() => navigate("/profile")} 
          />
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-latte text-charcoal font-heading text-sm md:text-base px-4 md:px-6 py-2 md:py-3 rounded-2xl shadow-md transition-all duration-200 ease-in-out hover:brightness-90"
          >
            Login
          </button>
        )}
      </header>

      {/* Large Microphone Section - Main Feature */}
      <section className="flex flex-col items-center gap-6 md:gap-8 mb-12 md:mb-16">
        <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-latte shadow-md flex items-center justify-center">
          <Mic className="w-16 h-16 md:w-20 md:h-20 text-charcoal" />
        </div>

        {/* Search Bar */}
        <div className="flex items-center w-full max-w-lg border-2 border-canary rounded-2xl px-4 py-3 bg-white shadow-md">
          <input
            type="text"
            placeholder="How can we help you today?"
            className="w-full bg-transparent outline-none placeholder-charcoal text-charcoal text-sm md:text-base"
          />
          <Search className="w-5 h-5 text-charcoal" />
        </div>
      </section>

      {/* Category Cards - Responsive Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <CardBase
          title="Community Support"
          icon={elderlyImg}
          bg="bg-blossom"
          path="/forum"
        />
        <CardBase
          title="Caregiving Resources"
          icon={computerImg}
          bg="bg-pistachio"
          path="/resources"
        />
        <CardBase
          title="Specialised Training"
          icon={breathingImg}
          bg="bg-serene"
          path="/training"
        />
      </section>
    </main>
  );
}
