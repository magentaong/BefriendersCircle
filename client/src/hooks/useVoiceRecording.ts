import { useRef, useState } from "react";

// SST
// Update query when transcription is complete
export function useVoiceRecording(setQuery: (text: string) => void) {
  // States for tracking active recording, accumulate audio data chunks during recording
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null); // real-time transcription

  // Store voice recording
  const startRecording = async () => {
    try {
      const SpeechRecognition = // Check for browser's built-in Speech Recognition API
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return startRecordingFallback(); // Fallback to manual if no speech recognition

      // Configure speech recognition for optimal performance
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US"; // English
      recognition.interimResults = true; // Get reults as user speaks
      recognition.continuous = true; // Listen until stopped

      // Speech recognition in real-time
      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) { // Process results from current recognition session
          currentTranscript += event.results[i][0].transcript; // Concatenate transcript segments
        }
        setQuery(currentTranscript); // Update query
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
      };

      recognitionRef.current = recognition; 
      // Start process
      recognition.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Mic access denied or SpeechRecognition failed:", error); // Error if mic access is denied
    }
  };

  const startRecordingFallback = async () => { // Fallback recording if Speech Recognition API is unavailable
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); // Request microphone access
      // Note that asking for microphone access only pops up when user clicks on the microphone
      // Capture audio 
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      // Reset audio chunks array 
      audioChunksRef.current = [];
      // Collect audio data chunks
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true); // Update UI based on recording
    } catch (error) {
      console.error("Mic access denied:", error);
    }
  };

  // Stop recording and process results
  const stopRecording = async () => {
    setIsRecording(false); // Update UI state

    // Handle stopping speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop(); // Stop listening
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current) { 
      mediaRecorderRef.current.stop(); // Stop recording MediaRecorder
      mediaRecorderRef.current.onstop = async () => {
        // Handler for when recording actually stops
        // Audio chunks in a single blob
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        // Prepare form data for server upload
        const formData = new FormData();
        formData.append("file", audioBlob, "input.webm");

        try {
          // Send audio to server for transcription
          const res = await fetch("http://localhost:5050/api/audio/transcribe", {
            method: "POST",
            body: formData, // Send audio file
          });
          const data = await res.json(); // Parse transcription
          setQuery(data.text); // Update query with transcribed text
        } catch (error) {
          console.error("Transcription error:", error);
        }
      };
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
}
