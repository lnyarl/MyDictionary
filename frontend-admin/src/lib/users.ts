import type { PaginatedResponse, User } from "../types/admin.types";
import { api } from "./api";

export interface CreateUserRequest {
	email: string;
	nickname: string;
	profilePicture?: string;
}

export const usersApi = {
	getUsers: async (page = 1, limit = 20): Promise<PaginatedResponse<User>> => {
		return api.get<PaginatedResponse<User>>(`/users?page=${page}&limit=${limit}`);
	},

	createUser: async (data: CreateUserRequest): Promise<User> => {
		return api.post<User>("/users", data);
	},
};
