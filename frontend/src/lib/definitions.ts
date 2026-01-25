import type {
	CreateDefinitionInput,
	Definition,
	DefinitionHistory,
	UpdateDefinitionInput,
} from "../types/definition.types";
import { api } from "./api";

export const definitionsApi = {
	getByWord: (wordId: string) => api.get<Definition[]>(`/words/${wordId}/definitions`),

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
};
