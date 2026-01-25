import { useCallback, useState } from "react";
import { feedApi } from "../lib/feed";
import type { Definition } from "../types/definition.types";

export function useFeed() {
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeed = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await feedApi.getFeed(pageNum, 20);

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
      fetchFeed(page + 1);
    }
  }, [loading, hasMore, page, fetchFeed]);

  return {
    definitions,
    loading,
    error,
    fetchFeed,
    loadMore,
    hasMore,
  };
}
