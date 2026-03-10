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
    try {
      const headers: HeadersInit = {};
      const refreshToken = this.authTokens?.refreshToken;

      if (refreshToken) {
        headers.Authorization = `Bearer ${refreshToken}`;
      }

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers,
      });

      if (!response.ok) {
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
      }

      return true;
    } catch {
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
        const refreshSuccess = await this.refreshToken();

        if (refreshSuccess) {
          if (this.authTokens?.accessToken) {
            (config.headers as Record<string, string>).Authorization = `Bearer ${this.authTokens.accessToken}`;
          }
          response = await fetch(url, config);
        } else {
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
