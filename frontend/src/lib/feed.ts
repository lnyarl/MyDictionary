import type { Definition } from "../types/definition.types";
import { api } from "./api";

interface PaginatedResponse<T> {
	data: T[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export const feedApi = {
	getFeed: (page = 1, limit = 20) =>
		api.get<PaginatedResponse<Definition>>(`/feed?page=${page}&limit=${limit}`),

	getAllFeed: (page = 1, limit = 20) =>
		api.get<PaginatedResponse<Definition>>(`/feed/all?page=${page}&limit=${limit}`),

	getRecommendations: (page = 1, limit = 20) =>
		api.get<PaginatedResponse<Definition>>(`/feed/recommendations?page=${page}&limit=${limit}`),
};
