import type { Follow, FollowStats } from "../types/follow.types";
import type { User } from "../types/user.types";
import { api } from "./api";

interface PaginatedResponse<T> {
	data: T[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		nextCursor?: string;
	};
}

export const followsApi = {
	follow: (userId: string) => api.post<Follow>(`/follows/${userId}`),

	unfollow: (userId: string) => api.delete(`/follows/${userId}`),

	checkFollowing: (userId: string) => api.get<{ isFollowing: boolean }>(`/follows/check/${userId}`),

	getFollowers: (userId?: string, page = 1, limit = 20, cursor?: string) => {
		const endpoint = userId ? `/follows/${userId}/followers` : "/follows/followers";
		const params = new URLSearchParams({ page: String(page), limit: String(limit) });
		if (cursor) params.append("cursor", cursor);
		return api.get<PaginatedResponse<User>>(`${endpoint}?${params.toString()}`);
	},

	getFollowing: (userId?: string, page = 1, limit = 20, cursor?: string) => {
		const endpoint = userId ? `/follows/${userId}/following` : "/follows/following";
		const params = new URLSearchParams({ page: String(page), limit: String(limit) });
		if (cursor) params.append("cursor", cursor);
		return api.get<PaginatedResponse<User>>(`${endpoint}?${params.toString()}`);
	},

	getStats: (userId?: string) => {
		const endpoint = userId ? `/follows/stats/${userId}` : "/follows/stats";
		return api.get<FollowStats>(endpoint);
	},
};
