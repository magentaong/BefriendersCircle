import { useState } from "react";

interface UseTextToSpeechParams {
  answer: any;
  loading: boolean;
  allSchemes: any[];
}

export function useTextToSpeech({ answer, loading, allSchemes }: UseTextToSpeechParams) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const playAnswer = async () => {
    try {
      setIsSpeaking(true);

      let textToSpeak = "";

      if (!answer && !loading) {
        textToSpeak = `Welcome. Please type your question in the left search box or use the microphone. 
          You can also choose one of the suggested prompts like: What is CTG.`;
      } else if (answer && allSchemes.length === 0) {
        textToSpeak = "Sorry, no valid scheme was found for your query.";
      } else if (answer) {
        const parts: string[] = [];

        if (answer.description) parts.push(answer.description);

        if (Array.isArray(answer.eligibility) && answer.eligibility.length > 0) {
          parts.push("Eligibility includes:");
          parts.push(answer.eligibility.map((e: string) => `• ${e}`).join(". "));
        }

        if (Array.isArray(answer.steps) && answer.steps.length > 0) {
          parts.push("Steps to apply:");
          parts.push(answer.steps.map((s: string, i: number) => `Step ${i + 1}: ${s}`).join(". "));
        }

        if (answer.link) {
          parts.push("You can find the link on screen for more details.");
        }

        textToSpeak = parts.join(" ");
      }

      if (!textToSpeak.trim()) {
        setIsSpeaking(false);
        return;
      }

      const res = await fetch("http://localhost:5050/api/audio/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak }),
      });

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onloadedmetadata = () => audio.play();
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
    } catch (err) {
      console.error("TTS failed:", err);
      setIsSpeaking(false);
    }
  };

  return {
    isSpeaking,
    playAnswer,
  };
}
