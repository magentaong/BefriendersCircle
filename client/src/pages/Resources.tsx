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

export default function ResourceLibrary() {
  const [query, setQuery] = useState("What subsidies does the government give for 60 years old");
  const [answer, setAnswer] = useState("");
  const [schemeTitle, setSchemeTitle] = useState("Seniors' Mobility and Enabling Fund");
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  const [latency, setLatency] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  // Format AI Answer
  const formatAnswer = (text: string) => {
    if (!text) return "";

    const lines = text.split("\n").filter((line: string) => line.trim() !== "");
    if (lines.length > 1) {
      lines[1] = `<strong><u>${lines[1]}</u></strong>`;
    }

    let formatted = lines.join("\n")
      .replace(/(Eligibility:)/gi, "<strong>Eligibility:</strong>")
      .replace(/(Steps to apply:)/gi, "<strong>Steps to apply:</strong>");

    formatted = formatted.replace(/•\s?(.*?)(?=\n|$)/g, "<li>$1</li>");
    if (formatted.includes("<li>")) {
      formatted = formatted.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");
    }

    formatted = formatted.replace(/\n/g, "<br>");
    return formatted;
  };

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

  // Latency detection
  useEffect(() => {
    if (!loading) return;
    if (initialLoad) return;
    const timeout = setTimeout(() => setLatency(true), 5000);
    return () => clearTimeout(timeout);
  }, [loading, initialLoad]);

  // Fetch AI response
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
      const fullAnswer = data.reply || "";

      // Extract scheme title
      const lines = fullAnswer.split("\n").filter((line: string) => line.trim() !== "");
      let detectedTitle = lines[1] || "Caregiver Advice";

      // If no scheme structure, fallback title
      if (!fullAnswer.includes("Eligibility:")) {
        detectedTitle = "Caregiver Advice";
      }

      setSchemeTitle(detectedTitle);
      setAnswer(fullAnswer);
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
        console.warn("SpeechRecognition not supported, using OpenAI fallback.");
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
        body: JSON.stringify({ text: answer }),
      });

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      console.error("TTS failed:", err);
    }
  };

  return (
    <main className="bg-white text-gray-800 px-8 py-6 w-full max-w-5xl mx-auto">
      <Navigation />

      {/* Top Tabs */}
      <div className="flex items-center justify-between w-full mt-2">
        <Link to="/forum">
          <button className="w-12 h-12 rounded-full bg-blossom shadow text-lg flex items-center justify-center">
            ←
          </button>
        </Link>

        <h1 className="text-lg font-bold bg-pistachio px-6 py-2 rounded-xl shadow text-center">
          Resource Library
        </h1>

        <Link to="/training">
          <button className="w-12 h-12 rounded-full bg-serene shadow text-lg flex items-center justify-center">
            →
          </button>
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
      {latency && !error && !initialLoad && (
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

      {/* Main Content */}
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

          <p className="text-gray-700 text-lg font-semibold">You searched:</p>

          <div className="relative w-full">
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What subsidies does the government give"
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
          {/* Result navigation */}
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

          {/* Upvotes */}
          <div className="flex justify-center items-center gap-2 mt-2">
            <span className="text-sm">10</span>
            <ThumbsUp className="w-4 h-4" fill="white" strokeWidth="3" />
          </div>

          {/* Answer content */}
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
                <div
                  key="loading"
                  className="flex flex-col items-center justify-center animate-fadeInSlow"
                >
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-700" />
                  <span className="text-gray-500 text-sm mt-2">Loading...</span>
                </div>
              ) : (
                <div
                  key={answer}
                  className="animate-fadeInSlow prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatAnswer(answer) }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
