import type { CreateDefinitionInput, Definition } from "../types/definition.types";
import { api } from "./api";

export const definitionsApi = {
	getByWord: (wordId: string) => api.get<Definition[]>(`/words/${wordId}/definitions`),

	create: (data: CreateDefinitionInput) => {
		const formData = new FormData();
		formData.append("content", data.content);
		formData.append("wordId", data.wordId);
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

	delete: (id: string) => api.delete(`/definitions/${id}`),

	getHistory: (wordId: string, userId: string) =>
		api.get<Definition[]>(`/definitions/history/${wordId}/${userId}`),
};
