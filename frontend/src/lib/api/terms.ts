import type { PaginatedResponseDto, TermResponseDto } from "@stashy/shared";
import { api } from "./api";

export type PaginationParams = {
  page?: number;
  limit?: number;
  cursor?: string;
};

export const termsApi = {
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

    return api.get<PaginatedResponseDto<TermResponseDto>>(
      `/terms/search?${queryParams.toString()}`,
    );
  },
};
