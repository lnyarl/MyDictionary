import { useEffect, useState } from "react";
import { usersApi } from "../lib/users";
import type { PaginationMeta, User } from "../types/admin.types";

export function useUsers(page = 1, limit = 20, _refreshKey = 0) {
	const [users, setUsers] = useState<User[]>([]);
	const [meta, setMeta] = useState<PaginationMeta>({
		page,
		limit,
		total: 0,
		totalPages: 0,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				setIsLoading(true);
				setError(null);
				const response = await usersApi.getUsers(page, limit);
				setUsers(response.data);
				setMeta(response.meta);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to fetch users");
			} finally {
				setIsLoading(false);
			}
		};

		fetchUsers();
	}, [page, limit]);

	return { users, meta, isLoading, error };
}
