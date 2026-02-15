import { useInfiniteQuery } from "@tanstack/react-query";
import { followsApi } from "../lib/api/follows";

type FollowQueryOptions = {
  enabled?: boolean;
};

export function useFollowers(userId?: string, options?: FollowQueryOptions) {
  return useInfiniteQuery({
    queryKey: ["followers", userId],
    queryFn: ({ pageParam }) =>
      followsApi.getFollowers(userId!, pageParam.page, 20, pageParam.cursor),
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
