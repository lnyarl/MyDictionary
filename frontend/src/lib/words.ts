import type { CreateWordInput, UpdateWordInput, Word } from "../types/word.types";
import { api } from "./api";

export const wordsApi = {
	async getAll(): Promise<Word[]> {
		return api.get<Word[]>("/words");
	},

	async getOne(id: string): Promise<Word> {
		return api.get<Word>(`/words/${id}`);
	},

	async create(data: CreateWordInput): Promise<Word> {
		return api.post<Word>("/words", data);
	},

	async update(id: string, data: UpdateWordInput): Promise<Word> {
		return api.patch<Word>(`/words/${id}`, data);
	},

	async delete(id: string): Promise<void> {
		return api.delete<void>(`/words/${id}`);
	},
};
