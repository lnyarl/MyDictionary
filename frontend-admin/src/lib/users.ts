import type { PaginatedResponse, User } from "../types/admin.types";
import { api } from "./api";

export const usersApi = {
	getUsers: async (
		page = 1,
		limit = 20,
	): Promise<PaginatedResponse<User>> => {
		return api.get<PaginatedResponse<User>>(
			`/users?page=${page}&limit=${limit}`,
		);
	},
};
