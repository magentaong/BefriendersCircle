import { useState } from "react";

interface UseTextToSpeechParams {
  answer: any;
  loading: boolean;
  allSchemes: any[];
}

// Uses server-side TTS API
export function useTextToSpeech({ answer, loading, allSchemes }: UseTextToSpeechParams) {
  // Tracks whether audio is playing
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Convert content to speach
  const playAnswer = async () => {
    try {
      // Set speaking to true for UI feedback
      setIsSpeaking(true);

      // Initialize empty string for speech content
      let textToSpeak = "";

      // TTS API from OpenAI only reads the description/output, not the parsed content,
      // and initially, when the chatbot is first loaded, TTS is not available
      // Therefore, added welcome/instruction (default) messages
      if (!answer && !loading) { // No answer and not loading
        textToSpeak = `Welcome. Please type your question in the left search box or use the microphone. 
          You can also choose one of the suggested prompts like: What is CTG.`;
      } else if (answer && allSchemes.length === 0) { // No valid schemes, main priority of chatbot is to find schemes
        textToSpeak = "Sorry, no valid scheme was found for your query.";
      } else if (answer) { // Valid answer exists
        // Collect parts of speech in array
        const parts: string[] = [];
        // Content to speak aloud in this order: description, elgiibility, steps, link (without reading the actual URL)
        if (answer.description) parts.push(answer.description);

        if (Array.isArray(answer.eligibility) && answer.eligibility.length > 0) {
          parts.push("Eligibility includes:");
          parts.push(answer.eligibility.map((e: string) => `• ${e}`).join(". "));
        }

        if (Array.isArray(answer.steps) && answer.steps.length > 0) {
          parts.push("Steps to apply:");
          // Numbered steps for clearer audio
          parts.push(answer.steps.map((s: string, i: number) => `Step ${i + 1}: ${s}`).join(". "));
        }

        // Link availability
        if (answer.link) {
          parts.push("You can find the link on screen for more details.");
        }
        // Join all parts of speech
        textToSpeak = parts.join(" ");
      }

      if (!textToSpeak.trim()) {
        setIsSpeaking(false); // Exit if no content to speak
        return;
      }

      // API request to server-side TTS service
      const res = await fetch("http://localhost:5050/api/audio/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSpeak }),
      });

      // Convert to binary audio data (blob)
      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob); // Object URL for audio playback
      const audio = new Audio(audioUrl); // HTML5 Audio element

      audio.onloadedmetadata = () => audio.play();
      audio.onended = () => setIsSpeaking(false); // Clean up speaking state when audio finishes playing
      audio.onerror = () => setIsSpeaking(false); // Handle audio playback errors
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
