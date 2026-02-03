import { api } from "./api";
import type { Word } from "./words";

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    nextCursor?: string;
  };
};
export type PaginationParams = {
  page?: number;
  limit?: number;
  cursor?: string;
};
export type SearchResult = Word;

export const searchApi = {
  search: (term: string, params?: PaginationParams) => {
    const queryParams = new URLSearchParams({ term });

    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }

    if (params?.cursor) {
      queryParams.append("cursor", params.cursor);
    }

    return api.get<PaginatedResponse<SearchResult>>(`/words/search?${queryParams.toString()}`);
  },
};
