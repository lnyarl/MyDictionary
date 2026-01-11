import { useCallback, useState } from "react";
import { searchApi } from "../lib/search";
import type { PaginationParams } from "../types/pagination.types";
import type { SearchResult } from "../types/search.types";

export function useSearch() {
	const [results, setResults] = useState<SearchResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [totalPages, setTotalPages] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [total, setTotal] = useState(0);

	const search = useCallback(
		async (term: string, params?: PaginationParams) => {
			if (!term.trim()) {
				setResults([]);
				setTotalPages(0);
				setTotal(0);
				return;
			}

			setLoading(true);
			setError(null);
			try {
				const response = await searchApi.search(term, params);
				setResults(response.data);
				setTotalPages(response.meta.totalPages);
				setCurrentPage(response.meta.page);
				setTotal(response.meta.total);
			} catch (err: any) {
				setError(err.message || "Failed to search");
				setResults([]);
				setTotalPages(0);
				setTotal(0);
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	const clearResults = useCallback(() => {
		setResults([]);
		setError(null);
		setTotalPages(0);
		setCurrentPage(1);
		setTotal(0);
	}, []);

	return {
		results,
		loading,
		error,
		totalPages,
		currentPage,
		total,
		search,
		clearResults,
	};
}
