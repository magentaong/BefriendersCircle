import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Mic,
  Search,
  Volume2,
  ThumbsUp,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import { useResourceChat } from "../hooks/useResourceChat";

export default function ResourceLibrary() {
  const { resources, categories, loading: resourcesLoading, error: resourcesError, refetch } =
    useResourceChat();

  const [activeTab, setActiveTab] = useState("Chatbot");
  const [query, setQuery] = useState(
    "What financial subsidies do you recommend for my grandfather who is 70-years old?"
  );
  const [answer, setAnswer] = useState<any>(null);
  const [schemeTitle, setSchemeTitle] = useState("Caregiver Advice");
  const [verifiedResource, setVerifiedResource] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  const [latency, setLatency] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  // Auto-adjust textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      requestAnimationFrame(() => {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      });
    }
  }, [query]);

  // Latency detection (10s) 
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    if (loading && !initialLoad) {
      timeout = setTimeout(() => {
        console.warn("[Latency Warning] Chatbot response taking longer than expected.");
        setLatency(true);
      }, 10000);
    } else {
      setLatency(false);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [loading, initialLoad]);

  // Fetch AI Response 
  const fetchResponse = async () => {
    try {
      setLoading(true);
      setError("");
      setLatency(false);
      setInitialLoad(false);

      const res = await fetch("http://localhost:5050/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user-123",
          prompt: query,
        }),
      });

      if (!res.ok) throw new Error("Chat interface failed to load");
      const data = await res.json();
      console.log("[AI Raw Reply]:", data.reply);
      console.log("[Verified Resource]:", data.verifiedResource);

      let parsedAnswer: any = null;
      const jsonMatch = data.reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedAnswer = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.warn("Failed to parse JSON block from AI reply:", e);
        }
      }

      const finalAnswer = parsedAnswer || data.verifiedResource || { description: data.reply };

      if (data.verifiedResource?.note) {
        finalAnswer.note = data.verifiedResource.note;
      }

      // Ensure we don't show irrelevant or empty answers
      if (
        !finalAnswer.description &&
        (!finalAnswer.eligibility || finalAnswer.eligibility.length === 0) &&
        (!finalAnswer.steps || finalAnswer.steps.length === 0)
      ) {
        setAnswer(null);
        setSchemeTitle("Caregiver Advice");
      } else {
        setAnswer(finalAnswer);
        setSchemeTitle(finalAnswer?.title || "Caregiver Advice");
      }

      setVerifiedResource(data.verifiedResource || null);
      refetch();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch response.");
    } finally {
      setLoading(false);
    }
  };

  const retryFetch = () => {
    setError("");
    fetchResponse();
  };

  // Voice Recording
  const startRecording = async () => {
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.warn("SpeechRecognition not supported, using fallback.");
        return startRecordingFallback();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setQuery(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Mic access denied or SpeechRecognition failed:", error);
    }
  };

  const startRecordingFallback = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Mic access denied:", error);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("file", audioBlob, "input.webm");

        try {
          const res = await fetch("http://localhost:5050/api/audio/transcribe", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          setQuery(data.text);
        } catch (error) {
          console.error("Transcription error:", error);
        }
      };
    }
  };

  const playAnswer = async () => {
    try {
      const res = await fetch("http://localhost:5050/api/audio/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: answer?.description || answer }),
      });
      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      console.error("TTS failed:", err);
    }
  };

  // --- Render Chatbot Content ---
  const renderChatbotContent = (res: any) => (
    <>
      {res.description && <p>{res.description}</p>}
      {Array.isArray(res.eligibility) && res.eligibility.length > 0 && (
        <div>
          <strong>Eligibility:</strong>
          <ul className="list-disc pl-5">
            {res.eligibility.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {Array.isArray(res.steps) && res.steps.length > 0 && (
        <div>
          <strong>Steps to apply:</strong>
          <ul className="list-disc pl-5">
            {res.steps.map((step: string, idx: number) => (
              <li key={idx}>{step}</li>
            ))}
          </ul>
        </div>
      )}
      {res.link && (
        <div>
          <a href={res.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            {res.link}
          </a>
        </div>
      )}
      {Array.isArray(res.tags) && res.tags.length > 0 && (
        <div className="text-xs mt-2 text-gray-600">
          Tags: {res.tags.join(", ")}
        </div>
      )}
      {res.category && <div className="text-xs text-gray-500">Category: {res.category}</div>}
    </>
  );

  const renderCategoryContent = (res: any) => (
    <div className="text-left break-words">
      {Array.isArray(res.eligibility) && res.eligibility.length > 0 && (
        <div>
          <strong>Eligibility:</strong>
          <ul className="list-disc pl-5">
            {res.eligibility.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {Array.isArray(res.steps) && res.steps.length > 0 && (
        <div>
          <strong>Steps to apply:</strong>
          <ul className="list-disc pl-5">
            {res.steps.map((step: string, idx: number) => (
              <li key={idx}>{step}</li>
            ))}
          </ul>
        </div>
      )}
      {Array.isArray(res.tags) && res.tags.length > 0 && (
        <div className="text-xs mt-2 text-gray-600">
          Tags: {res.tags.join(", ")}
        </div>
      )}
      {res.category && <div className="text-xs text-gray-500">Category: {res.category}</div>}
      {res.note && (
        <div className="mt-2 text-xs text-red-600 italic">
          {res.note}
        </div>
      )}
    </div>
  );

  // Filter valid and unique resources
  const validResources = resources.filter(
    (res) =>
      res.title?.trim() &&
      (res.description?.trim() ||
        (Array.isArray(res.eligibility) && res.eligibility.length > 0) ||
        (Array.isArray(res.steps) && res.steps.length > 0))
  );

  // Filter unique resources and remove empty cards
  const cleanedResources = resources
  .filter((res) => {
    // Normalize description
    const desc = typeof res.description === "string" ? res.description.trim() : "";
    res.description = desc;

    // Ensure at least one meaningful field
    return (
      (res.title && res.title.trim().length > 0) &&
      (desc.length > 0 ||
        (Array.isArray(res.eligibility) && res.eligibility.length > 0) ||
        (Array.isArray(res.steps) && res.steps.length > 0))
    );
  });

    const uniqueResources = Array.from(
    new Map(
      resources
        .filter((res) => {
          const hasEligibility = Array.isArray(res.eligibility) && res.eligibility.length > 0;
          const hasSteps = Array.isArray(res.steps) && res.steps.length > 0;
          return hasEligibility && hasSteps; // Must have both eligibility AND steps
        })
        .map((res) => [`${res.title?.trim() || "Untitled"}-${res.category || "unknown"}`, res])
    ).values()
  );
  
  const filteredResources =
    activeTab === "Chatbot"
      ? []
      : uniqueResources.filter(
          (res) => res.category?.toLowerCase() === activeTab.toLowerCase()
        );

  return (
    <main className="bg-white text-gray-800 px-8 py-6 w-full max-w-5xl mx-auto">
      <Navigation />

      {/* Top Navigation */}
      <div className="flex items-center justify-between w-full mt-2">
        <Link to="/forum">
          <button className="w-12 h-12 rounded-full bg-blossom shadow text-lg flex items-center justify-center">←</button>
        </Link>
        <h1 className="text-lg font-bold bg-pistachio px-6 py-2 rounded-xl shadow text-center w-full max-w-xs mx-auto">
          Resource Library
        </h1>
        <Link to="/training">
          <button className="w-12 h-12 rounded-full bg-serene shadow text-lg flex items-center justify-center">→</button>
        </Link>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4 flex justify-between items-center">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> {error}
          </span>
          <button
            onClick={retryFetch}
            className="ml-4 bg-red-200 px-3 py-1 rounded hover:bg-red-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* Latency Warning */}
      {latency && !error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-4 flex justify-between items-center">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> The chatbot is taking longer than expected.
          </span>
          <button
            onClick={retryFetch}
            className="ml-4 bg-yellow-200 px-3 py-1 rounded hover:bg-yellow-300"
          >
            Restart Chatbot
          </button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 w-full justify-center my-4">
        {categories.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-grow px-4 py-2 rounded-full shadow text-sm font-semibold 
              ${activeTab === tab ? "bg-[#c9e2d6] text-black" : "bg-gray-200 text-gray-700"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content */}
      {activeTab === "Chatbot" ? (
        <div className="flex flex-col md:flex-row mt-6 gap-6">
          {/* Left Section */}
          <div className="flex flex-col items-center w-full md:w-1/3 gap-4 bg-[#c9e2d6] p-6 rounded-xl shadow">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center shadow cursor-pointer transition-transform ${
                isRecording ? "bg-red-400 animate-pulse" : "bg-[#dce8e1]"
              }`}
              onClick={isRecording ? stopRecording : startRecording}
            >
              <Mic className="w-10 h-10" />
            </div>

            <p className="text-gray-700 text-lg font-semibold">Ask Me Anything!</p>

            <div className="relative w-full">
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What financial subsidies do you recommend for my grandfather who is 70-years old?"
                className="bg-white w-full text-sm text-gray-700 italic placeholder:text-gray-500 rounded-lg p-3 shadow focus:outline-none resize-none"
                style={{ minHeight: "100px" }}
              />
              <button
                onClick={fetchResponse}
                className="absolute bottom-3 right-3 p-2 rounded-full shadow bg-gray-200 hover:scale-105 transition"
                title="Search"
              >
                <Search className="w-4 h-4 text-black" />
              </button>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex-1 bg-[#c9e2d6] rounded-2xl p-4 shadow relative">
            <div className="flex justify-between items-center">
              <button className="p-2 shadow rounded-full bg-[#A8C6B7]">
                <ArrowLeft />
              </button>
              <h2 className="font-semibold text-center p-4">
                <strong>{schemeTitle}</strong>
              </h2>
              <button className="p-2 shadow rounded-full bg-white">
                <ArrowRight />
              </button>
            </div>

            <div className="flex justify-center items-center gap-2 mt-2">
              <ThumbsUp className="w-4 h-4" />
            </div>

            {/* Answer Content */}
            <div className="relative mt-4">
              <button
                onClick={playAnswer}
                className="absolute -top-6 right-4 p-3 rounded-full shadow bg-[#E4F1EA] transition transform hover:bg-green-200 hover:scale-110 hover:shadow-lg"
                title="Play Answer"
              >
                <Volume2 className="w-5 h-5 transition-colors hover:text-green-700" />
              </button>

              <div className="bg-white p-4 py-6 rounded-xl text-sm space-y-4 min-h-[100px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center animate-fadeInSlow">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-700" />
                    <span className="text-gray-500 text-sm mt-2">Loading...</span>
                  </div>
                ) : answer ? (
                  <div className="animate-fadeInSlow prose prose-sm max-w-none">
                    {renderChatbotContent(answer)}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No valid answer available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-lg mt-10">
          {filteredResources.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredResources.map((res, idx) => (
                  <div
                    key={res._id || idx}
                    className="bg-[#c9e2d6] rounded-2xl p-4 shadow hover:bg-[#b8d8c8] cursor-pointer transition"
                    onClick={() => res.link && window.open(res.link, "_blank")}
                    title={res.link ? "Click to learn more" : ""}
                  >
                    <h3 className="font-bold text-lg">{res.title || "Untitled Resource"}</h3>
                    <div className="bg-white p-4 mt-3 rounded-lg text-sm space-y-2">
                      {renderCategoryContent(res)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Refresh Button Below Grid */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={refetch}
                  className="flex items-center gap-2 bg-gray-200 px-3 py-1 text-sm rounded-full hover:bg-gray-300 transition"
                  title="Refresh Resources"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Resources
                </button>
              </div>
            </>
          ) : (
            <>
              No resources found for <strong>{activeTab}</strong>.
              <div className="flex justify-center mt-6">
                <button
                  onClick={refetch}
                  className="flex items-center gap-2 bg-gray-200 px-3 py-1 text-sm rounded-full hover:bg-gray-300 transition"
                  title="Refresh Resources"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Resources
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
}
