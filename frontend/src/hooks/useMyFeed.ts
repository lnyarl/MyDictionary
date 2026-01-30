import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateWordInput } from "@/types/word.types";
import { feedApi } from "../lib/feed";

export function useMyFeed() {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ["feed", "me"],
    queryFn: ({ pageParam }) => feedApi.getMyFeed(pageParam.page, 20, pageParam.cursor),
    initialPageParam: { page: 1, cursor: undefined as string | undefined },
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta.nextCursor) return undefined;
      return {
        page: lastPage.meta.page + 1,
        cursor: lastPage.meta.nextCursor,
      };
    },
  });

  const mutation = useMutation({
    mutationFn: (input: CreateWordInput) => feedApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const definitions = query.data?.pages.flatMap((page) => page.data) ?? [];

  return {
    definitions,
    createFeed: mutation.mutateAsync,
    loading: query.isLoading || query.isFetchingNextPage || mutation.isPending,
    error: query.error ? (query.error as Error).message : null,
    fetchMyFeed: (pageNum?: number) => {
      if (pageNum === 1) {
        query.refetch();
      }
    },
    loadMore: query.fetchNextPage,
    hasMore: !!query.hasNextPage,
    isRefetching: query.isRefetching,
  };
}
