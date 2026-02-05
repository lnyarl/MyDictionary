import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { termsApi } from "../lib/api/terms";

export function useSearch() {
  const [term, setTerm] = useState("");

  const query = useInfiniteQuery({
    queryKey: ["search", term],
    queryFn: ({ pageParam }) =>
      termsApi.search(term, { page: pageParam.page, limit: 20, cursor: pageParam.cursor }),

    initialPageParam: { page: 1, cursor: undefined as string | undefined },
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta.nextCursor) return undefined;
      return {
        page: lastPage.meta.page + 1,
        cursor: lastPage.meta.nextCursor,
      };
    },
    enabled: !!term.trim(),
  });

  const results = query.data?.pages.flatMap((page) => page.data) ?? [];
  const lastPage = query.data?.pages[query.data.pages.length - 1];

  const search = useCallback((newTerm: string) => {
    setTerm(newTerm);
  }, []);

  const clearResults = useCallback(() => {
    setTerm("");
  }, []);

  return {
    results,
    loading: query.isLoading,
    loadingMore: query.isFetchingNextPage,
    error: query.error ? (query.error as Error).message : null,
    totalPages: lastPage?.meta.totalPages ?? 0,
    currentPage: lastPage?.meta.page ?? 1,
    total: lastPage?.meta.total ?? 0,
    hasMore: !!query.hasNextPage,
    search,
    loadMore: query.fetchNextPage,
    clearResults,
  };
}
