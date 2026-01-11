import type {
	PaginatedResponse,
	PaginationParams,
} from "../types/pagination.types";
import type { SearchResult } from "../types/search.types";
import { api } from "./api";

export const searchApi = {
	search: (term: string, params?: PaginationParams) => {
		const queryParams = new URLSearchParams({ term });

		if (params?.page) {
			queryParams.append("page", params.page.toString());
		}
		if (params?.limit) {
			queryParams.append("limit", params.limit.toString());
		}

		return api.get<PaginatedResponse<SearchResult>>(
			`/words/search?${queryParams.toString()}`,
		);
	},
};
