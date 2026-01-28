import { useCallback, useState } from "react";
import { searchApi } from "../lib/search";
import type { SearchResult } from "../types/search.types";

export function useSearch() {
	const [results, setResults] = useState<SearchResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [totalPages, setTotalPages] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [total, setTotal] = useState(0);
	const [hasMore, setHasMore] = useState(false);
	const [cursor, setCursor] = useState<string | undefined>(undefined);
	const [currentTerm, setCurrentTerm] = useState("");

	const search = useCallback(async (term: string, pageNum = 1, nextCursor?: string, append = false) => {
		if (!term.trim()) {
			setResults([]);
			setTotalPages(0);
			setTotal(0);
			setHasMore(false);
			setCursor(undefined);
			return;
		}

		if (append) {
			setLoadingMore(true);
		} else {
			setLoading(true);
		}
		setError(null);

		try {
			const response = await searchApi.search(term, { page: pageNum, limit: 20, cursor: nextCursor } as any);

			if (append) {
				setResults((prev) => {
					const newItems = response.data.filter(
						(newItem) => !prev.some((existingItem) => existingItem.id === newItem.id)
					);
					return [...prev, ...newItems];
				});
			} else {
				setResults(response.data);
			}

			setTotalPages(response.meta.totalPages);
			setCurrentPage(response.meta.page);
			setTotal(response.meta.total);
			setHasMore(!!response.meta.nextCursor);
			setCursor(response.meta.nextCursor);
			setCurrentTerm(term);
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : "Failed to search";
			setError(errorMessage);
			if (!append) {
				setResults([]);
				setTotalPages(0);
				setTotal(0);
				setHasMore(false);
				setCursor(undefined);
			}
		} finally {
			setLoading(false);
			setLoadingMore(false);
		}
	}, []);

	const loadMore = useCallback(() => {
		if (!loadingMore && hasMore && currentTerm) {
			search(currentTerm, currentPage + 1, cursor, true);
		}
	}, [loadingMore, hasMore, currentTerm, currentPage, cursor, search]);

	const clearResults = useCallback(() => {
		setResults([]);
		setError(null);
		setTotalPages(0);
		setCurrentPage(1);
		setTotal(0);
		setHasMore(false);
		setCursor(undefined);
		setCurrentTerm("");
	}, []);

	return {
		results,
		loading,
		loadingMore,
		error,
		totalPages,
		currentPage,
		total,
		hasMore,
		search,
		loadMore,
		clearResults,
	};
}
