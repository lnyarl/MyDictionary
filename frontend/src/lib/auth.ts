import type { User } from "../types/user.types";
import { api } from "./api";

export interface GoogleLoginResponse {
	user: User;
	token: string;
}

export const authApi = {
	async getMe(): Promise<User> {
		return api.get<User>("/auth/me");
	},

	async logout(): Promise<void> {
		await api.post<void>("/auth/logout");
	},

	async loginWithGoogle(credential: string): Promise<GoogleLoginResponse> {
		return api.post<GoogleLoginResponse>("/auth/google", { credential });
	},
};
