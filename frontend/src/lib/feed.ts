import type { CreateWordInput } from "@/types/word.types";
import type { Definition } from "../types/definition.types";
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

export const feedApi = {
  create: (data: CreateWordInput) => api.post<Definition>("/feed", data),
  getFeed: (page = 1, limit = 20, cursor?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (cursor) params.append("cursor", cursor);
    return api.get<PaginatedResponse<Definition>>(`/feed?${params.toString()}`);
  },

  getMyFeed: (page = 1, limit = 20, cursor?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (cursor) params.append("cursor", cursor);
    return api.get<PaginatedResponse<Definition>>(`/feed/me?${params.toString()}`);
  },

  getAllFeed: (page = 1, limit = 20, cursor?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (cursor) params.append("cursor", cursor);
    return api.get<PaginatedResponse<Definition>>(`/feed/all?${params.toString()}`);
  },

  getRecommendations: (page = 1, limit = 20, cursor?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (cursor) params.append("cursor", cursor);
    return api.get<PaginatedResponse<Definition>>(`/feed/recommendations?${params.toString()}`);
  },
};
