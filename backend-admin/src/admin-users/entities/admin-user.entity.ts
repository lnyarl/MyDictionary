export const AdminRole = {
  SUPER_ADMIN: "super_admin",
  DEVELOPER: "developer",
  OPERATOR: "operator",
} as const;

export type AdminRoleType = (typeof AdminRole)[keyof typeof AdminRole];

export class AdminUser {
  id: string;
  username: string;
  password: string;
  role: AdminRoleType;
  mustChangePassword: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
