import { QueryClient } from "@tanstack/react-query";
import i18n from "@/lib/i18n";

import { toast } from "../hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export interface ApiError {
  statusCode: number;
  errorCode: string;
  message: string;
  timestamp?: string;
  path?: string;
  details?: Record<string, unknown>;
}

interface RequestOptions extends RequestInit {
  showErrorToast?: boolean;
}

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

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
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

    const config: RequestInit = {
      ...fetchOptions,
      headers,
      credentials: "include",
    };

    try {
      const response = await fetch(url, config);

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
