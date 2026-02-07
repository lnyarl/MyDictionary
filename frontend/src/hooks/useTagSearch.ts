import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { feedApi } from "../lib/api/feed";

export function useTagSearch() {
  const [tag, setTag] = useState("");

  const query = useInfiniteQuery({
    queryKey: ["tagSearch", tag],
    queryFn: ({ pageParam }) => feedApi.getFeedsByTag(tag, pageParam.page, 20, pageParam.cursor),

    initialPageParam: { page: 1, cursor: undefined as string | undefined },
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta.nextCursor) return undefined;
      return {
        page: lastPage.meta.page + 1,
        cursor: lastPage.meta.nextCursor,
      };
    },
    enabled: !!tag.trim(),
  });

  const results = query.data?.pages.flatMap((page) => page.data) ?? [];
  const lastPage = query.data?.pages[query.data.pages.length - 1];

  const search = useCallback((newTag: string) => {
    setTag(newTag);
  }, []);

  const clearResults = useCallback(() => {
    setTag("");
  }, []);

  return {
    results,
    loading: query.isLoading,
    loadingMore: query.isFetchingNextPage,
    error: query.error ? (query.error as Error).message : null,
    currentPage: lastPage?.meta.page ?? 1,
    hasMore: !!query.hasNextPage,
    search,
    loadMore: query.fetchNextPage,
    clearResults,
  };
}
