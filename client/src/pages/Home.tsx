import { useNavigate } from "react-router-dom";
import { Mic, Search } from "lucide-react";
import CardBase from "../components/common/CardBase";
import PageContainer from "../components/common/PageContainer";
import AppHeader from "../components/common/AppHeader";
import GradientBackground from "../components/common/GradientBackground";


import { fetchCurrentUser } from "../api/auth";
import { useState, useEffect } from "react";
import { useVoiceRecording } from "../hooks/useVoiceRecording";

import elderlyImg from "/Community.png";     
import computerImg from "/Resources.png";
import breathingImg from "/Training.png";

export default function Home() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

  const [searchQuery, setSearchQuery] = useState("");
  const [username, setUsername] = useState<string | undefined>();
  const { isRecording, startRecording, stopRecording } = useVoiceRecording(setSearchQuery);

  useEffect(() => {
    async function getUser() {
      if (isLoggedIn) {
        try {
          const user = await fetchCurrentUser();
          setUsername(user.name);
        } catch {
          setUsername(undefined);
        }
      }
    }
    getUser();
  }, [isLoggedIn]);

  
  return (
    
    <main className="min-h-screen w-full">
    <GradientBackground>
      <PageContainer>

      {/* Header */}
      <AppHeader
        isLoggedIn={isLoggedIn}
        onProfileClick={() => navigate("/profile")}
        onLoginClick={() => navigate("/login")}
      />

      {/* Mic */}
      <section className="flex flex-col items-center gap-8 mb-16">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            className={`w-32 h-32 rounded-full flex items-center justify-center shadow cursor-pointer transition-transform bg-latte hover:shadow-[0_0_32px_8px_rgba(249,232,217,0.65)] ${isRecording ? "bg-red-400 animate-pulse" : "bg-latte"}`}
          >
            <Mic className={`w-15 h-15 text-charcoal ${isRecording ? "text-red-500" : ""}`} />
          </button>

        {/* Search Bar */}
        <div className="flex items-center w-full max-w-xl border-2 border-latte rounded-2xl px-4 py-2 bg-white/80 hover:bg-white hover:shadow-[0_0_32px_8px_rgba(249,232,217,0.65)] shadow-md">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
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
      </PageContainer>

      </GradientBackground>
    </main>
  );
}