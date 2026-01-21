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

	updateProfile: (data: { nickname?: string; bio?: string; profilePicture?: File }) => {
		const formData = new FormData();
		if (data.nickname) formData.append("nickname", data.nickname);
		if (data.bio) formData.append("bio", data.bio);
		if (data.profilePicture) formData.append("profilePicture", data.profilePicture);

		return api.patch<User>("/users/me/profile", formData);
	},

	getUserProfile: (userId: string) => api.get<UserProfile>(`/users/${userId}/profile`),

	getUserWords: (userId: string, page = 1, limit = 20) =>
		api.get<PaginatedResponse<Word>>(`/users/${userId}/words?page=${page}&limit=${limit}`),

	getUserDefinitions: (userId: string, page = 1, limit = 20) =>
		api.get<PaginatedResponse<Definition>>(
			`/users/${userId}/definitions?page=${page}&limit=${limit}`,
		),
};
