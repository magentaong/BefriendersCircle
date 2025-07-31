import { useState, useEffect } from "react";

export interface ResourceChat {
  _id?: string;
  title: string;
  description: string;
  category: string;
  tags?: string[];
  link?: string;
  eligibility?: string[];
  steps?: string[];
  createdAt?: string;
}

interface UseResourceChatResult {
  resources: ResourceChat[];
  categories: string[];
  loading: boolean;
  error: string;
  refetch: () => void;
}

export function useResourceChat(): UseResourceChatResult {
  const [resources, setResources] = useState<ResourceChat[]>([]);
  const [categories, setCategories] = useState<string[]>(["Chatbot"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResources = async () => {
  try {
    setLoading(true);
    setError("");
    const res = await fetch("http://localhost:5050/api/resourcechat", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch chatbot resources.");
    const data = await res.json();
    setResources(data.resources.filter((r: ResourceChat) => r._id));
    setCategories(["Chatbot", ...data.categories]);
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchResources();
  }, []);

  return { resources, categories, loading, error, refetch: fetchResources };
}
