import type { CreateDefinitionInput, Definition } from "../types/definition.types";
import { api } from "./api";

export const definitionsApi = {
	getByWord: (wordId: string) => api.get<Definition[]>(`/words/${wordId}/definitions`),

	create: (data: CreateDefinitionInput) => api.post<Definition>("/definitions", data),

	delete: (id: string) => api.delete(`/definitions/${id}`),

	getHistory: (wordId: string, userId: string) =>
		api.get<Definition[]>(`/definitions/history/${wordId}/${userId}`),
};
