import React from "react";
import { Mic, Search, ArrowLeft, ArrowRight, Volume2, RefreshCw } from "lucide-react";

interface ChatbotPanelProps {
  query: string;
  setQuery: (value: string) => void;
  answer: any;
  allSchemes: any[];
  currentScheme: any;
  carouselIndex: number;
  setCarouselIndex: React.Dispatch<React.SetStateAction<number>>;
  renderChatbotContent: (res: any) => React.ReactNode;
  fetchResponse: () => void;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  playAnswer: () => void;
  isSpeaking: boolean;
  loading: boolean;
}

const ChatbotPanel: React.FC<ChatbotPanelProps> = ({
  query,
  setQuery,
  answer,
  allSchemes,
  currentScheme,
  carouselIndex,
  setCarouselIndex,
  renderChatbotContent,
  fetchResponse,
  isRecording,
  startRecording,
  stopRecording,
  playAnswer,
  isSpeaking,
  loading,
}) => {
  return (
    <div className="flex flex-col md:flex-row mt-6 gap-6">
      {/* Left Section */}
      <div className="flex flex-col items-center w-full md:w-1/3 gap-4 bg-[#c9e2d6] p-5 md:p-8 rounded-2xl shadow relative">
        <div
          role="button"
          aria-label="Microphone"
          data-testid="mic-btn"
          className={`w-24 h-24 rounded-full flex items-center justify-center shadow cursor-pointer transition-transform ${
            isRecording ? "bg-red-400 animate-pulse" : "bg-[#dce8e1]"
          }`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          <Mic className="w-10 h-10 hover:scale-105 transition" />
        </div>

        <p className="text-gray-600 text-lg font-semibold">Ask Me Anything!</p>

        <div className="relative w-full">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What financial subsidies do you recommend for seniors?"
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

        {["What is CTG?", "Government Grants", "Dementia Resources"].map((prompt, idx) => (
          <div
            key={prompt}
            className="relative w-full"
            style={{ opacity: 1 - (idx + 1) * 0.15 }}
          >
            <div
              onClick={() => setQuery(prompt)}
              className="cursor-pointer bg-white w-full text-sm text-gray-700 rounded-lg p-3 pr-10 shadow-sm hover:shadow-md transition"
            >
              {prompt}
            </div>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Search className="w-4 h-4 text-black" />
            </div>
          </div>
        ))}
      </div>

      {/* Right Section */}
      <div className="flex-1 bg-[#c9e2d6] rounded-2xl p-5 md:p-8 shadow relative">
        <div className="flex justify-between items-center">
          <button
            title = "Previous"
            onClick={() => setCarouselIndex((prev) => (prev - 1 + allSchemes.length) % allSchemes.length)}
            className="p-2 shadow rounded-full bg-[#A8C6B7] hover:scale-105 transition"
          >
            <ArrowLeft />
          </button>
          <h2 className="font-bold text-lg text-center p-4">
            {currentScheme?.title || "Caregiver Advice"}
          </h2>
          <button
            title = "Next"
            onClick={() => setCarouselIndex((prev) => (prev + 1) % allSchemes.length)}
            className="p-2 shadow rounded-full bg-white hover:scale-105 transition animate-fadeInSlow"
          >
            <ArrowRight />
          </button>
        </div>

        <div className="relative mt-4">
          <div className="relative bg-white overflow-visible p-4 py-6 rounded-lg text-sm space-y-4 min-h-[150px] flex-grow h-full shadow-md speech-bubble">
            <button
              onClick={playAnswer}
              className={`absolute bottom-1 right-4 z-10 p-3 rounded-full shadow bg-[#E4F1EA] transition hover:bg-green-200 ${
                isSpeaking ? "animate-pulse" : ""
              }`}
              title="Play Answer"
            >
              <Volume2 className="w-5 h-5 text-black" />
            </button>

            {loading ? (
              <div className="flex flex-col items-center justify-center animate-fadeInSlow">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-700" />
                <span className="text-gray-500 text-sm mt-2">Loading...</span>
              </div>
            ) : answer ? (
              <div className="animate-fadeInSlow prose prose-sm max-w-none">
                {allSchemes.length > 0 ? renderChatbotContent(currentScheme) : <p>No valid scheme found.</p>}
              </div>
            ) : (
              <p className="text-sm">
                <strong>Type your question in the search box or tap the microphone icon. </strong>
                You can also click on one of the suggested prompts.
              </p>
            )}
          </div>

          {allSchemes.length > 1 && (
            <p className="text-xs text-gray-500 text-center mt-2">
              {carouselIndex + 1}/{allSchemes.length}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatbotPanel;
