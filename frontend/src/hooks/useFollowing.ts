import { useInfiniteQuery } from "@tanstack/react-query";
import { followsApi } from "../lib/follows";

export function useFollowing(userId?: string) {
  return useInfiniteQuery({
    queryKey: ["following", userId],
    queryFn: ({ pageParam }) =>
      followsApi.getFollowing(userId!, pageParam.page, 20, pageParam.cursor),
    initialPageParam: { page: 1, cursor: undefined as string | undefined },
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta.nextCursor) return undefined;
      return {
        page: lastPage.meta.page + 1,
        cursor: lastPage.meta.nextCursor,
      };
    },
    enabled: !!userId,
  });
}
