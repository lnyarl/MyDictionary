import { QueryClient } from "@tanstack/react-query";
import i18n from "@/lib/i18n";

import { toast } from "../../hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

type ApiError = {
  statusCode: number;
  errorCode: string;
  message: string;
  timestamp?: string;
  path?: string;
  details?: Record<string, unknown>;
};

interface RequestOptions extends RequestInit {
  showErrorToast?: boolean;
}

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

function getLocalizedErrorMessage(error: ApiError): string {
  const translatedMessage = i18n.t(error.errorCode, { ns: "errors", defaultValue: "" });
  if (translatedMessage && translatedMessage !== error.errorCode) {
    return translatedMessage;
  }
  return error.message || i18n.t("UNKNOWN_ERROR", { ns: "errors" });
}

function showErrorToast(error: ApiError) {
  toast({
    variant: "destructive",
    description: getLocalizedErrorMessage(error),
  });
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<boolean> | null = null;
  private authTokens: AuthTokens | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.authTokens = this.getStoredAuthTokens();

    // 다른 탭에서 localStorage를 업데이트하면 메모리 토큰도 즉시 동기화
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === "stashy_auth_tokens") {
          if (e.newValue) {
            try {
              this.authTokens = JSON.parse(e.newValue) as AuthTokens;
            } catch {
              this.authTokens = null;
            }
          } else {
            this.authTokens = null;
          }
        }
      });
    }
  }

  setAuthTokens(tokens: AuthTokens) {
    this.authTokens = tokens;
    this.storeAuthTokens(tokens);
  }

  clearAuthTokens() {
    this.authTokens = null;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("stashy_auth_tokens");
    }
  }

  private getStoredAuthTokens(): AuthTokens | null {
    if (typeof window === "undefined") {
      return null;
    }

    const raw = window.localStorage.getItem("stashy_auth_tokens");
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthTokens;
    } catch (_error) {
      window.localStorage.removeItem("stashy_auth_tokens");
      return null;
    }
  }

  private storeAuthTokens(tokens: AuthTokens) {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem("stashy_auth_tokens", JSON.stringify(tokens));
  }

  private async refreshToken(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefreshToken();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async doRefreshToken(): Promise<boolean> {
    const logPrefix = "[Auth]";
    try {
      // localStorage에서 최신 토큰 재조회 (다른 탭이 이미 rotation했을 수 있음)
      const storedTokens = this.getStoredAuthTokens();
      if (storedTokens) {
        this.authTokens = storedTokens;
      }
      const refreshToken = this.authTokens?.refreshToken;

      console.log(`${logPrefix} refresh 시도`, {
        hasMemoryToken: !!this.authTokens?.refreshToken,
        hasStoredToken: !!storedTokens?.refreshToken,
        tokenPrefix: refreshToken ? refreshToken.slice(0, 8) + "..." : "없음",
        time: new Date().toISOString(),
      });

      if (!refreshToken) {
        console.warn(`${logPrefix} refresh token 없음 → 로그아웃`);
        return false;
      }

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        console.error(`${logPrefix} refresh 실패`, {
          status: response.status,
          body,
          tokenPrefix: refreshToken.slice(0, 8) + "...",
          time: new Date().toISOString(),
        });
        return false;
      }

      const data = (await response.json().catch(() => null)) as {
        token?: string;
        refreshToken?: string;
      } | null;

      if (data?.token) {
        this.setAuthTokens({
          accessToken: data.token,
          refreshToken: data.refreshToken ?? this.authTokens?.refreshToken,
        });
        console.log(`${logPrefix} refresh 성공`, {
          newTokenPrefix: data.token.slice(0, 8) + "...",
          rotated: !!data.refreshToken,
          time: new Date().toISOString(),
        });
      } else {
        console.error(`${logPrefix} refresh 응답에 token 없음`, { data });
        return false;
      }

      return true;
    } catch (error) {
      console.error(`${logPrefix} refresh 예외 발생`, { error, time: new Date().toISOString() });
      return false;
    }
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { showErrorToast: shouldShowToast = true, ...fetchOptions } = options;
    const url = `${this.baseUrl}${endpoint}`;
    const isFormData = fetchOptions.body instanceof FormData;

    const headers: Record<string, string> = {
      ...((fetchOptions.headers as Record<string, string>) || {}),
    };

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    if (this.authTokens?.accessToken) {
      headers.Authorization = `Bearer ${this.authTokens.accessToken}`;
    }

    const config: RequestInit = {
      ...fetchOptions,
      headers,
      credentials: "include",
    };

    try {
      let response = await fetch(url, config);

      if (response.status === 401 && endpoint !== "/auth/refresh" && endpoint !== "/auth/google") {
        console.warn("[Auth] 401 수신, refresh 시도", { endpoint, time: new Date().toISOString() });
        const refreshSuccess = await this.refreshToken();

        if (refreshSuccess) {
          if (this.authTokens?.accessToken) {
            (config.headers as Record<string, string>).Authorization = `Bearer ${this.authTokens.accessToken}`;
          }
          response = await fetch(url, config);
        } else {
          console.error("[Auth] refresh 실패 → 토큰 삭제 및 홈으로 이동", {
            endpoint,
            time: new Date().toISOString(),
          });
          // 이걸 하지 않으면 무한으로 "/"를 로딩한다
          if (new URL(window.location.href).pathname !== "/") {
            window.location.href = "/";
          }
          this.clearAuthTokens();
          throw new Error("Session expired");
        }
      }

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          statusCode: response.status,
          errorCode: "UNKNOWN_ERROR",
          message: "An error occurred",
        }));
        if (shouldShowToast) {
          showErrorToast(error);
        }
        throw error;
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error && typeof error === "object" && "statusCode" in error && "errorCode" in error) {
        throw error;
      }
      if (error instanceof Error && error.message === "Session expired") {
        throw error;
      }
      const networkError: ApiError = {
        statusCode: 0,
        errorCode: "NETWORK_ERROR",
        message: "Network error",
      };
      if (shouldShowToast) {
        showErrorToast(networkError);
      }
      throw networkError;
    }
  }

  async get<T>(endpoint: string, options?: { showErrorToast?: boolean }): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", ...options });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: { showErrorToast?: boolean },
  ): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      method: "POST",
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async patch<T>(
    endpoint: string,
    data: unknown,
    options?: { showErrorToast?: boolean },
  ): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: isFormData ? data : JSON.stringify(data),
      ...options,
    });
  }

  async delete<T>(endpoint: string, options?: { showErrorToast?: boolean }): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", ...options });
  }
}

export const api = new ApiClient();
