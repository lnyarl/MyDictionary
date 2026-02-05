import { api } from "./api";

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

export type Definition = {
  id: string;
  content: string;
  wordId: string;
  userId: string;
  term: string;
  isPublic: boolean;
  profilePicture?: string;
  nickname?: string;
  likesCount: number;
  isLiked: boolean;
  tags?: string[];
  termNumber: number;
  mediaUrls?: Array<{
    url: string;
    type: "image" | "video" | "unknown";
    title?: string;
    description?: string;
    image?: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type CreateDefinitionInput = {
  content: string;
  wordId: string;
  isPublic?: boolean;
  tags?: string[];
  files?: File[];
};

export type UpdateDefinitionInput = {
  content?: string;
  isPublic?: boolean;
  tags?: string[];
  files?: File[];
};

export type DefinitionHistory = {
  id: string;
  definitionId: string;
  content: string;
  tags: string[];
  mediaUrls: Array<{
    url: string;
    type: string;
    title?: string;
    description?: string;
    image?: string;
  }>;
  createdAt: string;
};

export const definitionsApi = {
  getByWord: (wordId: string) => api.get<Definition[]>(`/words/${wordId}/definitions`),

  getByTerm: (term: string) =>
    api.get<Definition[]>(`/definitions/term/${encodeURIComponent(term)}`),

  create: (data: CreateDefinitionInput) => {
    const formData = new FormData();
    formData.append("content", data.content);
    formData.append("wordId", data.wordId);
    if (data.isPublic !== undefined) {
      formData.append("isPublic", String(data.isPublic));
    }
    if (data.tags) {
      data.tags.forEach((tag) => {
        formData.append("tags[]", tag);
      });
    }
    if (data.files) {
      data.files.forEach((file) => {
        formData.append("files", file);
      });
    }
    return api.post<Definition>("/definitions", formData);
  },

  update: (id: string, data: UpdateDefinitionInput) => {
    const formData = new FormData();
    if (data.content !== undefined) {
      formData.append("content", data.content);
    }
    if (data.isPublic !== undefined) {
      formData.append("isPublic", String(data.isPublic));
    }
    if (data.tags) {
      data.tags.forEach((tag) => {
        formData.append("tags[]", tag);
      });
    }
    if (data.files) {
      data.files.forEach((file) => {
        formData.append("files", file);
      });
    }
    return api.patch<Definition>(`/definitions/${id}`, formData);
  },

  delete: (id: string) => api.delete(`/definitions/${id}`),

  getHistory: (definitionId: string) =>
    api.get<DefinitionHistory[]>(`/definitions/${definitionId}/history`),

  getByUserId: (userId: string, page = 1, limit = 20, cursor?: string) => {
    const params = new URLSearchParams({ userId, page: String(page), limit: String(limit) });
    if (cursor) params.append("cursor", cursor);
    return api.get<PaginatedResponse<Definition>>(`/definitions?${params.toString()}`);
  },
};
