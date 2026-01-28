import { useCallback, useState } from "react";
import type { CreateWordInput } from "@/types/word.types";
import { feedApi } from "../lib/feed";
import type { Definition } from "../types/definition.types";

export function useMyFeed() {
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  const createFeed = useCallback(async (input: CreateWordInput) => {
    setLoading(true);
    setError(null);
    try {
      await feedApi.create(input);
      const response = await feedApi.getMyFeed(1, 20);
      setDefinitions(response.data);
      setCursor(response.meta.nextCursor);
      setPage(1);
    } catch (err: any) {
      setError(err.message || "Failed to create word");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyFeed = useCallback(async (pageNum = 1, nextCursor?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await feedApi.getMyFeed(pageNum, 20, nextCursor);

      if (pageNum === 1) {
        setDefinitions(response.data);
      } else {
        setDefinitions((prev) => {
          const newItems = response.data.filter(
            (newItem) => !prev.some((existingItem) => existingItem.id === newItem.id)
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
      fetchMyFeed(page + 1, cursor);
    }
  }, [loading, hasMore, page, cursor, fetchMyFeed]);

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
