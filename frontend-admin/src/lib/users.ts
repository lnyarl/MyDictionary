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

	getUser: async (id: string): Promise<User> => {
		return api.get<User>(`/users/${id}`);
	},

	createUser: async (data: CreateUserRequest): Promise<User> => {
		return api.post<User>("/users", data);
	},

	createDummyUser: async (): Promise<User> => {
		return api.post<User>("/users/dummy", {});
	},

	impersonateUser: async (id: string): Promise<{ token: string }> => {
		return api.post<{ token: string }>(`/users/${id}/impersonate`, {});
	},
};
