import type { Definition } from "../types/definition.types";
import type { UserProfile } from "../types/follow.types";
import type { User } from "../types/user.types";
import type { Word } from "../types/word.types";
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

export const usersApi = {
	updateNickname: (nickname: string) => api.patch<User>("/users/me/nickname", { nickname }),

	getUserProfile: (userId: string) => api.get<UserProfile>(`/users/${userId}/profile`),

	getUserWords: (userId: string, page = 1, limit = 20) =>
		api.get<PaginatedResponse<Word>>(`/users/${userId}/words?page=${page}&limit=${limit}`),

	getUserDefinitions: (userId: string, page = 1, limit = 20) =>
		api.get<PaginatedResponse<Definition>>(
			`/users/${userId}/definitions?page=${page}&limit=${limit}`,
		),
};
