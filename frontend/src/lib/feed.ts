import { api } from "./api";
import type { Definition } from "../types/definition.types";

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
};
