export const AdminRole = {
	SUPER_ADMIN: "super_admin",
	DEVELOPER: "developer",
	OPERATOR: "operator",
} as const;

export type AdminRoleType = (typeof AdminRole)[keyof typeof AdminRole];

export type AdminUser = {
	id: string;
	username: string;
	role: AdminRoleType;
	mustChangePassword: boolean;
	lastLogin?: string;
	createdAt?: string;
};

export type LoginResponse = {
	admin: AdminUser;
	token: string;
};

export type User = {
	id: string;
	email: string;
	nickname: string;
	profilePicture?: string;
	createdAt: string;
	updatedAt: string;
};

export type PaginationMeta = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
};

export type PaginatedResponse<T> = {
	data: T[];
	meta: PaginationMeta;
};
