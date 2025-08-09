import { useState, useEffect } from "react";

export interface ResourceChat {
  _id?: string; // Optional database ID
  title: string; // required
  description: string; // required
  category: string; // required
  tags?: string[];
  link?: string;
  eligibility?: string[];
  steps?: string[];
  createdAt?: string;
}

interface UseResourceChatResult {
  resources: ResourceChat[]; // All resources and categories
  categories: string[];
  loading: boolean; // Loading state
  error: string; // Error message
  refetch: () => void;
}

export function useResourceChat(): UseResourceChatResult {
  // States for storing resources, categories, loading state and error state
  const [resources, setResources] = useState<ResourceChat[]>([]);
  const [categories, setCategories] = useState<string[]>(["Chatbot"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResources = async () => {
  try {
    // Set states
    setLoading(true);
    setError("");
    // Make API request to fetch resources
    // no-store ensures fresh data on every request
    const res = await fetch("http://localhost:5050/api/resourcechat", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch chatbot resources.");
    // Check if HTTP response was successful
    const data = await res.json(); // Parse JSON response
    // Excludes any temporary or invalid resources
    setResources(data.resources.filter((r: ResourceChat) => r._id));
    setCategories(["Chatbot", ...data.categories]); // Ensures chatbot tab is available even if no categories
  } catch (err: any) {
    setError(err.message); // Store error 
  } finally {
    setLoading(false);
  }
};

 // Automatically fetch resources 
  useEffect(() => {
    fetchResources(); // Call fetch function once on component initialization
  }, []);

  return { resources, categories, loading, error, refetch: fetchResources };
}
