export const AdminRole = {
  SUPER_ADMIN: "super_admin",
  DEVELOPER: "developer",
  OPERATOR: "operator",
} as const;

export type AdminRoleType = (typeof AdminRole)[keyof typeof AdminRole];

export interface AdminUser {
  id: string;
  username: string;
  role: AdminRoleType;
  mustChangePassword: boolean;
  lastLogin?: string;
  createdAt?: string;
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
