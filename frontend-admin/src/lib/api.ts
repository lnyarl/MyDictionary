const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const MAIN_BACKEND_URL =
	import.meta.env.VITE_MAIN_BACKEND_URL || "http://localhost:3000";

class ApiClient {
	private baseURL: string;

	constructor(baseURL: string) {
		this.baseURL = baseURL;
	}

	private async request<T>(
		endpoint: string,
		options: RequestInit = {},
	): Promise<T> {
		const url = `${this.baseURL}${endpoint}`;
		const config: RequestInit = {
			...options,
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
			credentials: "include",
		};

		const response = await fetch(url, config);

		if (!response.ok) {
			const error = await response.json().catch(() => ({
				message: "An error occurred",
			}));
			throw new Error(
				error.message || `HTTP error! status: ${response.status}`,
			);
		}

		if (response.headers.get("Content-Length") === "0") {
			return {} as T;
		} else {
			return await response.json();
		}
	}

	async get<T>(endpoint: string): Promise<T> {
		return await this.request<T>(endpoint, { method: "GET" });
	}

	async post<T>(endpoint: string, data?: unknown): Promise<T> {
		return await this.request<T>(endpoint, {
			method: "POST",
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async patch<T>(endpoint: string, data?: unknown): Promise<T> {
		return await this.request<T>(endpoint, {
			method: "PATCH",
			body: data ? JSON.stringify(data) : undefined,
		});
	}

	async delete<T>(endpoint: string): Promise<T> {
		return await this.request<T>(endpoint, { method: "DELETE" });
	}
}

export const api = new ApiClient(API_URL);
export const mainBackendApi = new ApiClient(MAIN_BACKEND_URL);
