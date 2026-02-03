import { useCallback, useState } from "react";
import { type Word, wordsApi } from "../lib/api/words";

export function useWords() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await wordsApi.getAll();
      setWords(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch words");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    words,
    loading,
    error,
    fetchWords,
  };
}
