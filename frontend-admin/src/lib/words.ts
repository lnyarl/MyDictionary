import { api } from "./api";

export interface Word {
	id: string;
	term: string;
	userId: string;
	isPublic: boolean;
	createdAt: string;
	updatedAt: string;
}

export const wordsApi = {
	getWordsByUserId: async (userId: string): Promise<Word[]> => {
		return api.get<Word[]>(`/users/${userId}/words`);
	},

	createDummyWord: async (userId: string): Promise<void> => {
		return api.post<void>(`/users/${userId}/words/dummy`, {});
	},
};
