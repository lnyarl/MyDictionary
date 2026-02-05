import { useInfiniteQuery } from "@tanstack/react-query";
import { feedApi } from "../lib/api/feed";

export function useFeedByTerm(term: string) {
  const query = useInfiniteQuery({
    queryKey: ["feed", "term", term],
    queryFn: ({ pageParam }) => feedApi.getFeedByTerm(term, pageParam.page, 20, pageParam.cursor),
    initialPageParam: { page: 1, cursor: undefined as string | undefined },
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta.nextCursor) return undefined;
      return {
        page: lastPage.meta.page + 1,
        cursor: lastPage.meta.nextCursor,
      };
    },
    enabled: !!term,
  });

  const feeds = query.data?.pages.flatMap((page) => page.data) ?? [];

  return {
    feeds,
    loading: query.isLoading,
    loadingMore: query.isFetchingNextPage,
    error: query.error,
    loadMore: query.fetchNextPage,
    hasMore: query.hasNextPage,
    refetch: query.refetch,
  };
}
