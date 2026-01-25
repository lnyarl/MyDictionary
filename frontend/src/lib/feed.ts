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
  };
}

export const feedApi = {
  create: (data: CreateWordInput) => api.post<Definition>("/feed", data),
  getFeed: (page = 1, limit = 20) =>
    api.get<PaginatedResponse<Definition>>(`/feed?page=${page}&limit=${limit}`),

  getMyFeed: (page = 1, limit = 20) =>
    api.get<PaginatedResponse<Definition>>(`/feed/me?page=${page}&limit=${limit}`),

  getAllFeed: (page = 1, limit = 20) =>
    api.get<PaginatedResponse<Definition>>(`/feed/all?page=${page}&limit=${limit}`),

  getRecommendations: (page = 1, limit = 20) =>
    api.get<PaginatedResponse<Definition>>(`/feed/recommendations?page=${page}&limit=${limit}`),
};
