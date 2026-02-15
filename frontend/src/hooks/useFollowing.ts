import { useInfiniteQuery } from "@tanstack/react-query";
import { followsApi } from "../lib/api/follows";

type FollowQueryOptions = {
  enabled?: boolean;
};

export function useFollowing(userId?: string, options?: FollowQueryOptions) {
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
    enabled: !!userId && (options?.enabled ?? true),
  });
}
