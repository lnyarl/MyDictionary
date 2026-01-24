import { useCallback, useState } from "react";
import { feedApi } from "../lib/feed";
import type { Definition } from "../types/definition.types";

export function useAllFeed() {
	const [definitions, setDefinitions] = useState<Definition[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	const fetchAllFeed = useCallback(async (pageNum = 1) => {
		setLoading(true);
		setError(null);
		try {
			const response = await feedApi.getAllFeed(pageNum, 20);

			if (pageNum === 1) {
				setDefinitions(response.data);
			} else {
				setDefinitions((prev) => [...prev, ...response.data]);
			}

			setHasMore(response.meta.page < response.meta.totalPages);
			setPage(pageNum);
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : "Failed to fetch feed";
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	}, []);

	const loadMore = useCallback(() => {
		if (!loading && hasMore) {
			fetchAllFeed(page + 1);
		}
	}, [loading, hasMore, page, fetchAllFeed]);

	return {
		definitions,
		loading,
		error,
		fetchAllFeed,
		loadMore,
		hasMore,
	};
}
