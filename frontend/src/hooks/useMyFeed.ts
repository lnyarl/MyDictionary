import { useCallback, useState } from "react";
import type { CreateWordInput } from "@/types/word.types";
import { feedApi } from "../lib/feed";
import type { Definition } from "../types/definition.types";

export function useMyFeed() {
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const createFeed = useCallback(async (input: CreateWordInput) => {
    setLoading(true);
    setError(null);
    try {
      await feedApi.create(input);
      const response = await feedApi.getMyFeed(1, 20);
      setDefinitions(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to create word");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyFeed = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await feedApi.getMyFeed(pageNum, 20);

      if (pageNum === 1) {
        setDefinitions(response.data);
      } else {
        setDefinitions((prev) => [...prev, ...response.data]);
      }

      setHasMore(response.meta.page < response.meta.totalPages);
      setPage(pageNum);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch feed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchMyFeed(page + 1);
    }
  }, [loading, hasMore, page, fetchMyFeed]);

  return {
    definitions,
    createFeed,
    loading,
    error,
    fetchMyFeed,
    loadMore,
    hasMore,
  };
}
