import type { BadgeEntity } from "@stashy/shared";
import { useEffect, useState } from "react";
import { badgesApi } from "../lib/badges";

export function useBadges(page = 1, limit = 20, refreshKey = 0) {
	const [badges, setBadges] = useState<BadgeEntity[]>([]);
	const [meta, setMeta] = useState<{
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	}>({
		page,
		limit,
		total: 0,
		totalPages: 0,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchBadges = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const response = await badgesApi.findAll(page, limit);
				setBadges(response.data);

				// Handle pagination meta based on what API returns
				// The Admin DTO response usually has total

				setMeta({
					page: response.meta.page,
					limit: response.meta.limit,
					total: 0,
					totalPages: 0,
				});
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to fetch badges");
			} finally {
				setIsLoading(false);
			}
		};

		fetchBadges();
	}, [page, limit, refreshKey]);

	return { badges, meta, isLoading, error };
}
