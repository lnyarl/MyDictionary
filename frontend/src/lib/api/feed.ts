import { api } from "./api";
import type { Definition } from "./definitions";

type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    nextCursor?: string;
  };
};

export type CreateDefinitionInput = {
  content: string;
  tags?: string[];
  isPublic?: boolean;
};

export type CreateFeedInput = {
  term: string;
  definition: CreateDefinitionInput;
};

export const feedApi = {
  create: (data: CreateFeedInput) => api.post<Definition>("/feed", data),
  getFeed: (page = 1, limit = 20, cursor?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (cursor) params.append("cursor", cursor);
    return api.get<PaginatedResponse<Definition>>(`/feed?${params.toString()}`);
  },

  getUserFeed: (nickname: string, page = 1, limit = 20, cursor?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (cursor) params.append("cursor", cursor);
    return api.get<PaginatedResponse<Definition>>(`/feed/user/${nickname}?${params.toString()}`);
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

  getFeedByTerm: (term: string, page = 1, limit = 20, cursor?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (cursor) params.append("cursor", cursor);
    return api.get<PaginatedResponse<Definition>>(`/feed/term/${term}?${params.toString()}`);
  },

  getFeedsByTag: (tag: string, page = 1, limit = 20, cursor?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (cursor) params.append("cursor", cursor);
    return api.get<PaginatedResponse<Definition>>(
      `/feed/tag/${encodeURIComponent(tag)}?${params.toString()}`,
    );
  },

  getLikedFeed: (page = 1, limit = 20, cursor?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (cursor) params.append("cursor", cursor);
    return api.get<PaginatedResponse<Definition>>(`/feed/liked?${params.toString()}`);
  },
};
