import { useEffect, useState } from "react";

export interface Resource {
  _id: string;
  title: string;
  url: string;
  description?: string;
  tags?: string[];
  category: string;
  isVerified?: boolean;
  likes?: number;
}

interface UseResourcesResult {
  categories: string[];
  resources: Resource[];
  loading: boolean;
  error: string;
  refetch: () => void;
}

const defaultCategories = ["Chatbot", "Financial", "Medical", "Services", "General"];

export function useResources(): UseResourcesResult {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError("");

      const res: Response = await fetch("http://localhost:5050/api/resources");
      if (!res.ok) throw new Error("Failed to fetch resources");

      const data: Resource[] = await res.json();
      setResources(data);

      // Dynamically extract unique categories
      const uniqueCategories = Array.from(
        new Set([...defaultCategories, ...data.map((r) => r.category || "General")])
      );
      setCategories(uniqueCategories);
    } catch (err: any) {
      setError(err.message || "Error fetching resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return { categories, resources, loading, error, refetch: fetchResources };
}
