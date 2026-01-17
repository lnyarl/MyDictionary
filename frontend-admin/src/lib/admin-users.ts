import type { AdminRoleType, AdminUser } from "../types/admin.types";
import { api } from "./api";

export interface CreateAdminUserRequest {
  username: string;
  password: string;
  role: Exclude<AdminRoleType, "super_admin">;
}

export interface UpdateAdminRoleRequest {
  role: Exclude<AdminRoleType, "super_admin">;
}

export const adminUsersApi = {
  getAll: async (): Promise<AdminUser[]> => {
    return api.get<AdminUser[]>("/admin-users");
  },

  create: async (data: CreateAdminUserRequest): Promise<AdminUser> => {
    return api.post<AdminUser>("/admin-users", data);
  },

  updateRole: async (id: string, data: UpdateAdminRoleRequest): Promise<AdminUser> => {
    return api.patch<AdminUser>(`/admin-users/${id}/role`, data);
  },
};
