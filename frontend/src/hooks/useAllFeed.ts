import { useCallback, useState } from "react";
import { feedApi } from "../lib/feed";
import type { Definition } from "../types/definition.types";

export function useAllFeed() {
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  const fetchAllFeed = useCallback(async (pageNum = 1, nextCursor?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await feedApi.getAllFeed(pageNum, 20, nextCursor);

      if (pageNum === 1) {
        setDefinitions(response.data);
      } else {
        setDefinitions((prev) => {
          const newItems = response.data.filter(
            (newItem) => !prev.some((existingItem) => existingItem.id === newItem.id),
          );
          return [...prev, ...newItems];
        });
      }

      setHasMore(!!response.meta.nextCursor);
      setPage(pageNum);
      setCursor(response.meta.nextCursor);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch feed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchAllFeed(page + 1, cursor);
    }
  }, [loading, hasMore, page, cursor, fetchAllFeed]);

  return {
    definitions,
    loading,
    error,
    fetchAllFeed,
    loadMore,
    hasMore,
  };
}
