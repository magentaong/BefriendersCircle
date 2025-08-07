import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Info,
  HeartPulse,
  DollarSign,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import Navigation from '../components/Navigation';

import TagFilterGrid from "../components/resources/TagFilterGrid";
import ChatbotPanel from "../components/resources/ChatbotPanel";
import { useResourceChat } from "../hooks/useResourceChat";
import { useCarousel } from "../hooks/useCarousel";
import { useChatbotAPI } from "../hooks/useChatbotAPI";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import { useVoiceRecording } from "../hooks/useVoiceRecording";

export default function ResourceLibrary() {
  const { resources, categories, loading: resourcesLoading, error: resourcesError, refetch } =
    useResourceChat();

  const [activeTab, setActiveTab] = useState("Chatbot");
  const tabOrder = ["Chatbot", "General", "Financial", "Medical"];
  const [query, setQuery] = useState(
    "What financial subsidies do you recommend for seniors?"
  );
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
 
  const categoryIcons: Record<string, React.ReactNode> = {
  Chatbot: <Bot size={22} />,
  General: <Info size={22} />,
  Medical: <HeartPulse size={22} />,
  Financial: <DollarSign size={22} />,
  };
  
  const uniqueResources = Array.from(
    new Map(
      resources
        .filter((res) => {
          const hasEligibility = Array.isArray(res.eligibility) && res.eligibility.length > 0;
          const hasSteps = Array.isArray(res.steps) && res.steps.length > 0;
          return res._id && hasEligibility && hasSteps; // Ensure it's saved in DB
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

  const {
    getIndexForTab,
    updateCarouselIndex,
    getGroupedItems,
    scrollLeft,
    scrollRight,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    getProgress,
  } = useCarousel(filteredResources);

  const retryFetch = () => {
    setError("");
    fetchResponse();
  };

  const {
    fetchResponse,
    answer,
    setAnswer,
    verifiedResource,
    relatedSchemes,
    error,
    setError,
    loading,
    latency,
    initialLoad,
  } = useChatbotAPI({ query, setQuery, refetch });

  const {
    isRecording,
    startRecording,
    stopRecording
  } = useVoiceRecording(setQuery);
  
  const allSchemes = Array.from(
    new Map(
      [
        ...(answer ? [answer] : []),
        ...(relatedSchemes || []),
        ...(verifiedResource ? [verifiedResource] : [])
      ]
      .filter(s => s && s.title)
      .map(s => [s.title.trim().toLowerCase(), s]) // normalize
    ).values()
  );

  const {
    isSpeaking,
    playAnswer
  } = useTextToSpeech({ answer, loading, allSchemes });


  const currentScheme = allSchemes[carouselIndex % allSchemes.length] || null;

  // Render Chatbot Content
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

  const groupSize = 3;
  const totalGroups = Math.max(1, Math.ceil(filteredResources.length / groupSize));

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

  const orderedCategories = tabOrder.filter(tab => categories.includes(tab));

  // RENDER COMPONENT=======================================================
  return (
    <main className="bg-white text-gray-800 px-8 py-6 w-full max-w-5xl mx-auto">
      {/* Header with Logo and Profile */}
      <Navigation header={ "Resource Library" } />

      {/* Top Navigation */}
      <div className="flex items-center justify-between w-full gap-2 mb-4 md:mb-6">
        <Link to="/forum">
          <button className="w-12 h-12 rounded-full bg-blossom shadow text-lg flex items-center justify-center hover:scale-105"><ArrowLeft></ArrowLeft></button>
        </Link>

        {/* Title Card */}
        <h1 className="w-full h-12 rounded-full bg-pistachio shadow text-lg flex items-center justify-center gap-2 md:text-lg font-bold text-charcoal">Resource Library</h1>

        <Link to="/training">
          <button className="w-12 h-12 rounded-full bg-serene shadow text-lg flex items-center justify-center hover:scale-105"><ArrowRight></ArrowRight></button>
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
      <div className="flex flex-wrap gap-3 w-full justify-center my-4">
        {orderedCategories.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center justify-center gap-2 flex-grow px-4 py-2 rounded-full shadow text-sm font-semibold hover:scale-105 transition
              ${activeTab === tab ? "bg-[#c9e2d6] text-black" : "bg-gray-200 text-gray-700"}`}
          >
            {categoryIcons[tab] || <FileText size={16} />}
            <span>{tab}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      {activeTab === "Chatbot" ? (
        <ChatbotPanel
          query={query}
          setQuery={setQuery}
          answer={answer}
          allSchemes={allSchemes}
          currentScheme={currentScheme}
          carouselIndex={carouselIndex}
          setCarouselIndex={setCarouselIndex}
          renderChatbotContent={renderChatbotContent}
          fetchResponse={fetchResponse}
          isRecording={isRecording}
          startRecording={startRecording}
          stopRecording={stopRecording}
          playAnswer={playAnswer}
          isSpeaking={isSpeaking}
          loading={loading}
        />
      ) : (
        <div className="text-center text-lg mt-10">
          {filteredResources.length > 0 ? (
            <>
              {/* Tag Filter Row + Conditional View */}
              <TagFilterGrid
                resources={filteredResources}
                renderContent={renderCategoryContent}
                selectedTag={selectedTag}
                setSelectedTag={setSelectedTag}
                expandedCardId={expandedCardId}
                setExpandedCardId={setExpandedCardId}
              />

              {/* Show carousel only when no tag selected */}
              {!selectedTag && (
                <div className="w-full mt-4 flex flex-col items-center gap-4">
                  {/* Cards Group View */}
                  <div className="relative w-full overflow-hidden">
                    <button
                      aria-label="carousel-left"
                      onClick={() => scrollLeft(activeTab)}
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full hover:scale-105 transition"
                    >
                      <ChevronLeft size={35} />
                    </button>

                    <div
                      className="w-full flex justify-center gap-4 px-12"
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={(e) => handleTouchEnd(activeTab)}
                    >
                      {filteredResources
                        .slice(getIndexForTab(activeTab) * groupSize, getIndexForTab(activeTab) * groupSize + groupSize)
                        .map((res) => (
                          <div
                            key={res._id}
                            onClick={() => {
                              if (expandedCardId === res._id) {
                                if (res.link) window.open(res.link, "_blank");
                              } else {
                                setExpandedCardId(res._id || "temp-id");
                              }
                            }}
                            className="w-full sm:w-[280px] min-h-[300px] sm:min-h-[340px] flex-shrink-0 bg-[#c9e2d6] rounded-2xl p-2 shadow hover:bg-[#b8d8c8] cursor-pointer transition-all duration-300 ease-in-out"
                          >
                            <h3 className="font-bold text-lg mb-2">{res.title || "Untitled Resource"}</h3>

                            <div
                              className={`relative bg-white p-3 rounded-lg shadow text-sm space-y-2 transition-all duration-300 ease-in-out overflow-hidden ${
                                expandedCardId === res._id ? "max-h-[1000px]" : "max-h-[200px]"
                              }`}
                            >
                              <div className="break-words">{renderCategoryContent(res)}</div>

                              {expandedCardId !== res._id && (
                                <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-lg" />
                              )}
                            </div>

                            {expandedCardId !== res._id && (
                              <div className="flex justify-center mb-1 p-2">
                                <ChevronDown className="w-4 h-4 text-gray-700 animate-bounce" />
                              </div>
                            )}
                          </div>
                        ))}
                    </div>

                    <button
                      aria-label="carousel-right"
                      onClick={() => scrollRight(activeTab)}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-white rounded-full hover:scale-105 transition"
                    >
                      <ChevronRight size={35} />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden relative">
                    <div
                      role="progressbar"
                      className="h-full bg-[#8CBFAB] transition-all duration-300"
                      style={{
                        width: `${((getIndexForTab(activeTab) + 1) / totalGroups) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

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
