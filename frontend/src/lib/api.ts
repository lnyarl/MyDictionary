const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export interface ApiError {
	message: string;
	statusCode: number;
	error?: string;
}

export class ApiClient {
	private baseUrl: string;

	constructor(baseUrl: string = API_BASE_URL) {
		this.baseUrl = baseUrl;
	}

	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseUrl}${endpoint}`;
		const isFormData = options.body instanceof FormData;

		const headers: Record<string, string> = {
			...((options.headers as Record<string, string>) || {}),
		};

		if (!isFormData) {
			headers["Content-Type"] = "application/json";
		}

		const config: RequestInit = {
			...options,
			headers,
			credentials: "include", // Important for cookies
		};

		try {
			const response = await fetch(url, config);

			if (!response.ok) {
				const error: ApiError = await response.json().catch(() => ({
					message: "An error occurred",
					statusCode: response.status,
				}));
				throw error;
			}

			// Handle 204 No Content
			if (response.status === 204) {
				return {} as T;
			}

			return await response.json();
		} catch (error) {
			if (error && typeof error === "object" && "statusCode" in error) {
				throw error;
			}
			throw {
				message: "Network error",
				statusCode: 0,
			} as ApiError;
		}
	}

	async get<T>(endpoint: string): Promise<T> {
		return this.request<T>(endpoint, { method: "GET" });
	}

	async post<T>(endpoint: string, data?: any): Promise<T> {
		const isFormData = data instanceof FormData;
		return this.request<T>(endpoint, {
			method: "POST",
			body: isFormData ? data : data ? JSON.stringify(data) : undefined,
		});
	}

	async patch<T>(endpoint: string, data: any): Promise<T> {
		const isFormData = data instanceof FormData;
		return this.request<T>(endpoint, {
			method: "PATCH",
			body: isFormData ? data : JSON.stringify(data),
		});
	}

	async delete<T>(endpoint: string): Promise<T> {
		return this.request<T>(endpoint, { method: "DELETE" });
	}
}

export const api = new ApiClient();
