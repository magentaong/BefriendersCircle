import { useState } from "react";

interface ChatbotAPIResponse {
  answer: any; // Primary AI-generated answer
  verifiedResource: any; // Database resource to verify with
  relatedSchemes: any[]; // Related schemes
  error: string; // Error message if request fails
  latency: boolean; // Indicate slow response
}

interface UseChatbotAPIProps {
  query: string;
  setQuery: (val: string) => void; // Update query
  refetch: () => void; // Refresh external data
}

export function useChatbotAPI({ query, setQuery, refetch }: UseChatbotAPIProps) {
  // State management for API
  const [loading, setLoading] = useState(false); // Loading
  const [answer, setAnswer] = useState<any>(null); // From AI
  const [verifiedResource, setVerifiedResource] = useState<any>(null); // From Database
  const [relatedSchemes, setRelatedSchemes] = useState<any[]>([]); // Additional schemes
  const [error, setError] = useState(""); // Error messages 
  const [latency, setLatency] = useState(false); // Slow response for greater than 10 seconds
  const [initialLoad, setInitialLoad] = useState(true); // First API call

  // Fetch chatbot response
  const fetchResponse = async () => {
    let latencyTimeout: NodeJS.Timeout; // Set timer to detect slow response
    // Note that the API is very slow :(

    try {
      // Reset states at start of new request
      setLoading(true); // Show loading indicator
      setError(""); // Clear errors
      setLatency(false); // Reset latency flag
      setInitialLoad(false); // Made at least one API call

      // Detection after 10 seconds
      latencyTimeout = setTimeout(() => setLatency(true), 10000);

      // API call to chatbot endpoint
      const res = await fetch("http://localhost:5050/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user-123", // Hardcoded for demo
          prompt: query, // Send user's question
        }),
      });

      // Clear latency timeout since response arrived
      clearTimeout(latencyTimeout);

      // Check if response is successful
      if (!res.ok) throw new Error("Chat interface failed to load");
      const data = await res.json();

      // Parse AI results from response 
      let parsedAIResults = [];
      try {
        parsedAIResults = JSON.parse(data.reply); // Parse AI reply as JSON 
        if (!Array.isArray(parsedAIResults)) parsedAIResults = [parsedAIResults]; // Ensure it's always an array 
      } catch {
        parsedAIResults = data.relatedSchemes || []; // If parsing fails, fallback to related schemes
      }

      // Filter out unwanted responses
      parsedAIResults = parsedAIResults.filter(
        (scheme: any) =>
          scheme?.title &&
          // Initially used for cards that are not really schemes, 
          // but still caregiver advice in which there is no apaprent title
          // Will keep the same as a lot of cards tend to follow this empathetic pattern 
          !scheme.title.toLowerCase().includes("it's wonderful") &&
          !scheme.title.toLowerCase().includes("you're")
      );

      // Access database schemes 
      const validDBSchemes = (data.relatedSchemes || []).filter((s: any) => s && s._id);
      // Ensure AI schemes is an array
      const aiSchemes = Array.isArray(parsedAIResults) ? parsedAIResults : [];
      // Combine AI schemes with database schemes and avoid duplicates (if title is the same)
      const combinedSchemes = [
        ...aiSchemes, // AI-generated schemes first (less likelihood for errors, as our database is limited)
        ...validDBSchemes.filter(
          (dbScheme: any) =>
            !aiSchemes.some( // Include DB schemes that do not have matching AI schemes
              (aiScheme: any) =>
                aiScheme.title?.toLowerCase() === dbScheme.title?.toLowerCase()
            )
        ),
      ];

      // Remove duplicates based on title (case-insensitive)
      const dedupedSchemes = Array.from(
        new Map(
          combinedSchemes
            .filter((s) => s && s.title) // Only include schemes with titles
            .map((s) => [s.title.toLowerCase(), s]) // Lowercase for deduplication
        ).values()
      );

      // Prefer AI schemes, fallback to verified resource
      // Initially, verified database was a priority, but somehow that resulted in more errors 
      // as our database does not contain all questions to answers that users may give 
      const primaryAnswer = aiSchemes.length > 0
        ? aiSchemes[0]
        : (data.verifiedResource || null);

      // Update state
      setAnswer(primaryAnswer); // Answer to display
      setVerifiedResource(data.verifiedResource || null); 
      setRelatedSchemes(dedupedSchemes); // Store related schemes for carousel
      refetch(); 
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch response.");
    } finally {
      setLoading(false); // Cleanup, run regardless of success or failure
    }
  };

  return {
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
    setLatency,
    setInitialLoad,
  };
}
