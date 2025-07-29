import { useState, useRef, useEffect } from "react";
import { Mic, Search, Volume2, ThumbsUp, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ModularCard from "../components/ModularCard";

// INTERFACE DEFINITIONS=======================================================
interface Resource {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image?: string;
  url?: string;
  category?: string;
  source?: string;
  isVerified?: boolean;
}

// MAIN COMPONENT=======================================================
export default function ResourceLibrary() {
  // STATE MANAGEMENT=======================================================
  const [query, setQuery] = useState("What subsidies does the government give for 60 years old");
  const [answer, setAnswer] = useState("Loading...");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // DATA FILTERING=======================================================
  // Filter resources based on search term (searches title, description, and tags)
  const filteredResources = resources.filter((resource: Resource) =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // FETCH RESOURCES FROM BACKEND=======================================================
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setResourcesLoading(true);
        setResourcesError(null);
        
        // Fetch government schemes from backend API
        const response = await fetch("http://localhost:5050/api/resources/government-schemes");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setResources(data);
      } catch (error) {
        console.error("Error fetching resources:", error);
        setResourcesError("Failed to load resources. Please try again later.");
        
        // Fallback to static data if API fails
        const fallbackData = [
          {
            id: "1",
            title: "Seniors Mobility & Enabling Fund",
            description: "Financial assistance for mobility aids and home healthcare items to help seniors maintain independence and quality of life.",
            tags: ["Age 60+", "Financial", "Mobility", "Healthcare"],
            image: "/Support/Exercise.png",
            url: "https://www.aic.sg/financial-assistance/smef"
          },
          {
            id: "2", 
            title: "Caregivers Training Grant",
            description: "Up to $200 per year for caregivers to attend approved training courses to better care for their loved ones.",
            tags: ["Caregivers", "Training", "Financial", "Education"],
            image: "/Support/Training.png",
            url: "https://www.aic.sg/financial-assistance/ctg"
          },
          {
            id: "3",
            title: "Home Caregiving Grant",
            description: "Monthly cash grant of $200 for families caring for seniors with permanent moderate disability at home.",
            tags: ["Caregivers", "Financial", "Home Care", "Monthly"],
            image: "/Support/Family.png",
            url: "https://www.aic.sg/financial-assistance/hcg"
          }
        ];
        setResources(fallbackData);
      } finally {
        setResourcesLoading(false);
      }
    };

    fetchResources();
  }, []);

  // AUTO-RESIZE TEXTAREA EFFECT=======================================================
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      requestAnimationFrame(() => {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      });
    }
  }, [query]);

  // VOICE THINGY=======================================================
  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      setIsListening(true);
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  };

  // GOLDER RETRIEVE, FETCHES AI RESPONSE=======================================================
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
      setAnswer("Failed to fetch response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // RENDER COMPONENT=======================================================
  return (
    <main className="min-h-screen bg-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        
        {/*HEADER SECTION - Logo, Title, and Profile Picture*/}
        <header className="flex justify-between items-center mb-6 md:mb-8">
          <Link to="/">
            <img src="/ESC.svg" alt="BefriendersCircle Logo" className="h-10 w-10 md:h-12 md:w-12" />
          </Link>
          <h1 className="text-lg md:text-xl font-bold text-charcoal">Resource Library</h1>
          <Link to="/profile">
            <img src="/Avatar.png" alt="User Profile" className="h-8 w-8 md:h-10 md:w-10 rounded-full" />
          </Link>
        </header>

        {/*Navigation arrows !!!*/}
        <div className="flex items-center justify-between w-full mb-4 md:mb-6">
          {/*left Arrow - Community Support (Pink theme) */}
          <Link to="/forum">
            <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blossom shadow text-lg flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </Link>

          {/* Centered Title with Resource Library theme */}
          <h2 className="text-base md:text-lg font-bold bg-pistachio px-4 md:px-6 py-2 rounded-xl shadow text-center flex-grow mx-2 md:mx-4">
            Resource Library
          </h2>

          {/* right arrow - Specialised Training (Blue theme) */}
          <Link to="/training">
            <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-serene shadow text-lg flex items-center justify-center">
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </Link>
        </div>

        {/*search bar*/}
        <div className="mb-6 md:mb-8">
          <div className="relative flex items-center bg-white rounded-2xl border-2 border-canary px-4 py-3 shadow-md max-w-md mx-auto">
            <Search className="w-4 h-4 text-charcoal mr-2 flex-shrink-0" />
            <input
              type="text"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search government schemes..."
              className="flex-1 bg-transparent outline-none text-sm md:text-base text-charcoal placeholder:text-gray-500"
            />
          </div>
        </div>

        {/*AI chat bot section*/}
        <section className="mb-6 md:mb-8">
          <div className="bg-pistachio rounded-2xl p-4 md:p-6 shadow-md">
            <h2 className="text-lg md:text-xl font-bold text-charcoal mb-4 md:mb-6 text-center">
              Ask About Government Schemes
            </h2>
            
            {/* extra plarge microphone button - Primary voice input interface */}
            <div className="flex justify-center mb-4 md:mb-6">
              <button
                onClick={handleVoiceInput}
                className={`w-28 h-28 md:w-32 md:h-32 rounded-full bg-latte shadow-md flex items-center justify-center transition-all duration-200 hover:brightness-90 ${
                  isListening ? 'voice-listening' : ''
                }`}
                title="Voice input"
              >
                <Mic className="w-12 h-12 md:w-16 md:h-16 text-charcoal" />
              </button>
            </div>
            
            {/* Text Input Area - Manual query input with auto-resize */}
            <div className="relative mb-4 md:mb-6">
              <div className="bg-white rounded-2xl p-3 md:p-4 pr-16 md:pr-20 border-2 border-canary shadow-md">
                <textarea
                  ref={textareaRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What subsidies does the government give for 60 years old"
                  className="bg-transparent w-full text-charcoal placeholder:text-gray-500 focus:outline-none resize-none overflow-hidden text-sm md:text-base"
                  style={{ transition: "height 0.2s ease" }}
                />
              </div>
              
              {/* Search Button - Triggers AI response */}
              <button
                onClick={fetchResponse}
                disabled={loading}
                className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-latte text-charcoal hover:brightness-90 disabled:opacity-50 transition-all"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* AI Response Display Area */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-md">
              {/* Response Header - Helpful indicator and volume control */}
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm md:text-base text-charcoal">Helpful</span>
                  <ThumbsUp className="w-4 h-4 text-charcoal" />
                </div>
                
                {/* Volume Button - For audio playback (future feature) */}
                <button className="p-2 rounded-full bg-latte shadow-md hover:brightness-90 transition-all">
                  <Volume2 className="w-4 h-4 text-charcoal" />
                </button>
              </div>
              
              {/* Tags - Categorization of the AI response */}
              <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                <span className="bg-blossom text-charcoal text-xs md:text-sm px-3 py-1 rounded-full font-medium">
                  Age 60+
                </span>
                <span className="bg-pistachio text-charcoal text-xs md:text-sm px-3 py-1 rounded-full font-medium">
                  Financial
                </span>
                <span className="bg-serene text-charcoal text-xs md:text-sm px-3 py-1 rounded-full font-medium">
                  Healthcare
                </span>
              </div>
              
              {/* AI response segment*/}
              <div className="bg-canary p-3 md:p-4 rounded-xl">
                {loading ? (
                  //show loading state
                  <div className="flex items-center justify-center py-6 md:py-8">
                    <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-charcoal"></div>
                    <span className="ml-3 text-charcoal text-sm md:text-base">Loading response...</span>
                  </div>
                ) : (
                  //formatted AI response
                  <div className="text-sm md:text-base text-charcoal leading-relaxed">
                    {answer}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/*===resources section===*/}
        <section className="mb-6 md:mb-8">
          <div className="bg-pistachio rounded-2xl p-4 md:p-6 shadow-md">
            <h2 className="text-lg md:text-xl font-bold text-charcoal mb-4 md:mb-6 text-center">
              Available Government Schemes
            </h2>
            
            {/*loading state*/}
            {resourcesLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-charcoal"></div>
                <span className="ml-3 text-charcoal">Loading resources...</span>
              </div>
            )}

            {/*show error if any occur*/}
            {resourcesError && (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{resourcesError}</p>
                <p className="text-sm text-charcoal">Showing fallback resources</p>
              </div>
            )}

            {/*show resources */}
            {!resourcesLoading && (
              <div className="space-y-4 md:space-y-6">
                {filteredResources.length > 0 ? (
                  filteredResources.map((resource) => (
                    <ModularCard key={resource.id} {...resource} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-charcoal">No resources found matching your search.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}