// This is specifically for the database
import { useEffect, useState } from "react";

export interface Resource {
  _id: string; // Required 
  title: string; // reqruired
  url: string; // Required
  description?: string; 
  tags?: string[];
  category: string; // Required, note that categories here are different from the categories in the Chatbot
  // Initially wanted to map the categories in the database to the four main ones below, 
  // but more efficient to handle it in the prompt engineering instead
  isVerified?: boolean;
  likes?: number; // unused
}

interface UseResourcesResult {
  categories: string[];
  resources: Resource[];
  loading: boolean;
  error: string;
  refetch: () => void;
}

// Predefined list of categories
// Similar shebang as ResourceChat
const defaultCategories = ["Chatbot", "Financial", "Medical", "Services", "General"];

export function useResources(): UseResourcesResult {
  const [resources, setResources] = useState<Resource[]>([]);
  // Starts with a predefined list
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError("");

      const res: Response = await fetch("http://localhost:5050/api/resources");
      if (!res.ok) throw new Error("Failed to fetch resources");

      // Parse JSON response as resource array
      const data: Resource[] = await res.json();
      setResources(data);

      // Dynamically extract unique categories
      const uniqueCategories = Array.from(
        new Set([...defaultCategories, ...data.map((r) => r.category || "General")]) // Include default categories 
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
