import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight, Mic, Search, Volume2, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function ResourceLibrary() {
  const [query, setQuery] = useState("What subsidies does the government give for 60 years old");
  const [answer, setAnswer] = useState("Loading...");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);


  useEffect(() => {
  const textarea = textareaRef.current;
  if (textarea) {
    requestAnimationFrame(() => {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    });
  }
}, [query]);


  const fetchResponse = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5050/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user-123",
          prompt: query,
        }),
      });

      const data = await res.json();
      setAnswer(data.reply);
    } catch (err) {
      console.error(err);
      setAnswer("Failed to fetch response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-white text-gray-800 p-4 flex flex-col items-center gap-4 w-full max-w-6xl md:max-w-xl md:p-10"> 
      {/* Header */}
      <div className="w-full flex justify-between items-center">
        <Link to="/">
          <img src="/ESC.svg" alt="Logo" className="w-12 h-12" />
        </Link>
        <img src="/avatar.png" alt="User" className="w-10 h-10 rounded-full" />
      </div>

      {/* Tabs */}
        <div className="flex items-center justify-between w-full mt-2">
        {/* Left Arrow */}
        <Link to="/community">
            <button className="w-12 h-12 rounded-full bg-blossom shadow text-lg flex items-center justify-center">
            ←
            </button>
        </Link>

        {/* Centered Title */}
        <h1 className="text-lg font-bold bg-pistachio px-6 py-2 rounded-xl shadow text-center flex-grow mx-4">
            Resource Library
        </h1>

        {/* Right Arrow */}
        <Link to="/community">
            <button className="w-12 h-12 rounded-full bg-serene shadow text-lg flex items-center justify-center">
            →
            </button>
        </Link>
        </div>

    
        {/* Input Box */}
        <div className="relative flex flex-grow justify-center">
        <div className="bg-[#c9e2d6] rounded-xl py-4 pr-12 pl-16 shadow overflow-visible">
                <textarea
                    ref={textareaRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="What subsidies does the government give for 60 years old"
                    className="bg-transparent w-full text-sm text-gray-700 italic placeholder:text-gray-500 focus:outline-none resize-none overflow-hidden"
                    style={{ transition: "height 0.2s ease" }}
                />

                </div>
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 bg-[#dce8e1] rounded-full size-16 flex items-center justify-center shadow">
                    <Mic className="w-8 h-8" />
                </div>
            <button
            onClick={fetchResponse}
            className="absolute right-3 bottom-1 -translate-y-1/2 p-2 rounded-full shadow hover:scale-105 transition"
            >
            <Search className="w-4 h-4 text-black" />
            </button>
        </div>

        {/* Result Box */}
        <div className="bg-[#c9e2d6] rounded-2xl p-4 w-full">
            <div className="flex justify-between items-center">
            <button className="p-2 shadow rounded-full bg-[#A8C6B7]">
                <ArrowLeft />
            </button>
            <h2 className="font-semibold text-center p-4">Seniors' Mobility and Enabling Fund</h2>
            <button className="p-2 shadow rounded-full bg-white">
                <ArrowRight />
            </button>
            </div>

            <div className="flex justify-center items-center gap-2 mt-2">
            <span className="text-sm">10</span>
            <ThumbsUp className="w-4 h-4" fill="white" stroke-width="3" />
            </div>

            <div className="flex gap-2 mt-2">
            <span className="bg-white text-sm px-2 py-1 rounded-full">Age 60</span>
            <span className="bg-white text-sm px-2 py-1 rounded-full">Financial</span>
            </div>
            <div className="relative">
                {/* Overlapping Volume Button */}
                <button className="absolute -top-6 right-4 p-3 rounded-full shadow bg-[#E4F1EA]">
                    <Volume2 className="w-5 h-5" />
                </button>

                {/* Answer Box */}
                <div className="bg-white p-4 py-6 rounded-xl mt-8 text-sm space-y-4">
                    {loading ? <p>Loading...</p> : <div>{answer}</div>}
                </div>
            </div>
        </div>
    
    </main>
  );
}

// TODO: Work on responsiveness so webapp has layout that's wanted, worked on mobile first so oopsies (sorry)