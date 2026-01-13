import type { AdminUser, LoginResponse } from "../types/admin.types";
import { api } from "./api";

export const adminAuthApi = {
	login: async (username: string, password: string): Promise<LoginResponse> => {
		return api.post<LoginResponse>("/auth/login", { username, password });
	},

	getMe: async (): Promise<AdminUser> => {
		return api.get<AdminUser>("/auth/me");
	},

	changePassword: async (
		currentPassword: string,
		newPassword: string,
	): Promise<{ message: string }> => {
		return api.post<{ message: string }>("/auth/change-password", {
			currentPassword,
			newPassword,
		});
	},

	logout: async (): Promise<{ message: string }> => {
		return api.post<{ message: string }>("/auth/logout");
	},
};
