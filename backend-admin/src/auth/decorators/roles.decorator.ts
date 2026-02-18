import { AdminRoleType } from "@/admin-users/entities/admin-user.entity";
import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export const Roles = (...roles: AdminRoleType[]) =>
  SetMetadata(ROLES_KEY, roles);
