import { useInfiniteQuery } from "@tanstack/react-query";
import { feedApi } from "../lib/api/feed";

export function useLikedFeed() {
  const query = useInfiniteQuery({
    queryKey: ["feed", "liked"],
    queryFn: ({ pageParam }) => feedApi.getLikedFeed(pageParam.page, 20, pageParam.cursor),
    initialPageParam: { page: 1, cursor: undefined as string | undefined },
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta.nextCursor) return undefined;
      return {
        page: lastPage.meta.page + 1,
        cursor: lastPage.meta.nextCursor,
      };
    },
  });

  const definitions = query.data?.pages.flatMap((page) => page.data) ?? [];

  return {
    definitions,
    loading: query.isLoading || query.isFetchingNextPage,
    error: query.error ? (query.error as Error).message : null,
    fetchLikedFeed: (pageNum?: number) => {
      if (pageNum === 1) {
        query.refetch();
      }
    },
    loadMore: query.fetchNextPage,
    hasMore: !!query.hasNextPage,
    isRefetching: query.isRefetching,
  };
}
