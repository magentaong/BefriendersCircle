import { useState } from "react";

interface ChatbotAPIResponse {
  answer: any;
  verifiedResource: any;
  relatedSchemes: any[];
  error: string;
  latency: boolean;
}

interface UseChatbotAPIProps {
  query: string;
  setQuery: (val: string) => void;
  refetch: () => void;
}

export function useChatbotAPI({ query, setQuery, refetch }: UseChatbotAPIProps) {
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<any>(null);
  const [verifiedResource, setVerifiedResource] = useState<any>(null);
  const [relatedSchemes, setRelatedSchemes] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [latency, setLatency] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchResponse = async () => {
    let latencyTimeout: NodeJS.Timeout;

    try {
      setLoading(true);
      setError("");
      setLatency(false);
      setInitialLoad(false);

      latencyTimeout = setTimeout(() => setLatency(true), 10000);

      const res = await fetch("http://localhost:5050/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user-123",
          prompt: query,
        }),
      });

      clearTimeout(latencyTimeout);

      if (!res.ok) throw new Error("Chat interface failed to load");
      const data = await res.json();

      let parsedAIResults = [];
      try {
        parsedAIResults = JSON.parse(data.reply);
        if (!Array.isArray(parsedAIResults)) parsedAIResults = [parsedAIResults];
      } catch {
        parsedAIResults = data.relatedSchemes || [];
      }

      parsedAIResults = parsedAIResults.filter(
        (scheme: any) =>
          scheme?.title &&
          !scheme.title.toLowerCase().includes("it's wonderful") &&
          !scheme.title.toLowerCase().includes("you're")
      );

      const validDBSchemes = (data.relatedSchemes || []).filter((s: any) => s && s._id);
      const aiSchemes = Array.isArray(parsedAIResults) ? parsedAIResults : [];
      const combinedSchemes = [
        ...aiSchemes,
        ...validDBSchemes.filter(
          (dbScheme: any) =>
            !aiSchemes.some(
              (aiScheme: any) =>
                aiScheme.title?.toLowerCase() === dbScheme.title?.toLowerCase()
            )
        ),
      ];

      const dedupedSchemes = Array.from(
        new Map(
          combinedSchemes
            .filter((s) => s && s.title)
            .map((s) => [s.title.toLowerCase(), s])
        ).values()
      );

      const primaryAnswer = aiSchemes.length > 0
        ? aiSchemes[0]
        : (data.verifiedResource || null);

      setAnswer(primaryAnswer);
      setVerifiedResource(data.verifiedResource || null);
      setRelatedSchemes(dedupedSchemes);
      refetch();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch response.");
    } finally {
      setLoading(false);
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
