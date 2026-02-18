import { api } from "./api";
import type { User } from "./users";

export type GoogleLoginResponse = {
  user: User;
  token: string;
  refreshToken?: string;
};

function getStoredRefreshToken(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const raw = window.localStorage.getItem("stashy_auth_tokens");
  if (!raw) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(raw) as { refreshToken?: string };
    return parsed.refreshToken;
  } catch (_error) {
    return undefined;
  }
}

export const authApi = {
  async getMe({ showErrorToast = true }): Promise<User> {
    return api.get<User>("/auth/me", { showErrorToast });
  },

  async logout(): Promise<void> {
    await api.post<void>("/auth/logout", { refreshToken: getStoredRefreshToken() });
  },

  async loginWithGoogle(credential: string): Promise<GoogleLoginResponse> {
    return api.post<GoogleLoginResponse>("/auth/google", { credential });
  },
};
