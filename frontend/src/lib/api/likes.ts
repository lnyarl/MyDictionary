import { api } from "./api";

export const likesApi = {
  toggle: (definitionId: string) => api.post<{ liked: boolean }>(`/likes/${definitionId}`),
};
