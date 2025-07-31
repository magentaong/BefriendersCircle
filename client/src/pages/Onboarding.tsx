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
    <main className="flex flex-col items-center gap-10 p-6">
      <img src="/ESC.svg" alt="Logo" className="w-16" />
      <h2 className="text-xl font-semibold">What is your preferred language?</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {languages.map((lang) => (
          <button
            key={lang.label}
            className={`rounded-2xl shadow-md bg-canary flex flex-col items-center outline-none border-2 px-5 pt-5 ${
              selected === lang.label ? "border-[#964B00]" : "border-transparent"
            }`}
            onClick={() => setSelected(lang.label)}
          >
            <img src={lang.img} alt={lang.label} className="w-30 h-30 object-cover" />
          </button>
        ))}
      </div>

      <button
        className="bg-latte text-black px-5 py-2 rounded-2xl shadow hover:brightness-95"
        onClick={handleSelect}
        disabled={!selected}
      >
        {selected ? "Continue" : "Skip"}
      </button>
    </main>
  );
}
//TODO: I'm p sure galaxy fold 5 messes up the responsiveness here.. SCREW THAT PHONE MODEL HMPH