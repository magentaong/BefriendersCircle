import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const languages = [
  { label: "English", img: "/english.png"},
  { label: "Chinese", img: "/chinese.png"},
  { label: "Tamil", img: "/tamil.png"},
  { label: "Malay", img: "/malay.png"},
];

export default function Onboarding() {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSelect = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      await axios.patch(
        "http://localhost:5050/api/auth/me",
        { language: selected },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate("/");
    } catch (err) {
      alert("Something went wrong. Try again.");
      console.error(err);
    }
  };

  return (
    <main className="flex flex-col items-center gap-8 md:gap-10 p-4 md:p-6 max-w-4xl mx-auto">
      <img src="/ESC.svg" alt="Logo" className="w-12 md:w-16 mt-8 md:mt-12" />
      <h2 className="text-lg md:text-xl font-semibold text-charcoal">What is your preferred language?</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 w-full max-w-md">
        {languages.map((lang) => (
          <button
            key={lang.label}
            className={`rounded-2xl shadow-md bg-canary flex flex-col items-center outline-none border-2 px-3 md:px-4 pt-3 md:pt-4 ${
              selected === lang.label ? "border-charcoal" : "border-transparent"
            }`}
            onClick={() => setSelected(lang.label)}
          >
            <img src={lang.img} alt={lang.label} className="w-20 h-20 md:w-24 md:h-24 object-cover" />
            <span className="text-xs md:text-sm text-charcoal mt-2">{lang.label}</span>
          </button>
        ))}
      </div>

      <button
        className="bg-latte text-charcoal px-4 md:px-6 py-2 md:py-3 rounded-2xl shadow-md hover:brightness-95 font-semibold w-full max-w-md"
        onClick={handleSelect}
        disabled={!selected}
      >
        {selected ? "Continue" : "Skip"}
      </button>
    </main>
  );
}