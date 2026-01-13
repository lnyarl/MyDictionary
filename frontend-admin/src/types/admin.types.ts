export interface AdminUser {
	id: string;
	username: string;
	mustChangePassword: boolean;
}

export interface LoginResponse {
	admin: AdminUser;
	token: string;
}

export interface User {
	id: string;
	email: string;
	nickname: string;
	profilePicture?: string;
	createdAt: string;
	updatedAt: string;
}

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface PaginatedResponse<T> {
	data: T[];
	meta: PaginationMeta;
}
