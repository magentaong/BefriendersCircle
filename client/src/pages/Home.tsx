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
    <main className="w-full max-w-6xl mx-auto px-5 py-5">
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <img src="/ESC.svg" alt="BefriendersCircle Logo" className="h-20 w-20" />
  
        {isLoggedIn ? (
          <img
            src="/Avatar.png"
            alt="User Avatar"
            className="h-15 w-15 rounded-full cursor-pointer"
            onClick={() => navigate("/profile")} 
          />
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-latte text-charcoal font-heading text-lg px-5 py-2 rounded-2xl shadow-md transition-all duration-200 ease-in-out hover:shadow-lg hover:brightness-90"
          >
            Login
          </button>
        )}

      </header>

      {/* Mic */}
      <section className="flex flex-col items-center gap-8 mb-16">
        <div className="w-32 h-32 rounded-full bg-latte shadow-md flex items-center justify-center">
          <Mic className="w-15 h-15 text-charcoal" />
        </div>

        {/* Search Bar */}
        <div className="flex items-center w-full max-w-xl border-3 border-canary rounded-2xl px-4 py-2 bg-white shadow-md">
          <input
            type="text"
            placeholder="How can we help you today?"
            className="w-full bg-transparent outline-none placeholder-charcoal text-charcoal"
          />
          <Search className="w-5 h-5 text-charcoal" />
        </div>
      </section>

      {/* Category Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-8">
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