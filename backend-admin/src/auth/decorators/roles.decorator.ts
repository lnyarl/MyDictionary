import { SetMetadata } from "@nestjs/common";
import type { AdminRoleType } from "../admin-users/entities/admin-user.entity";

export const ROLES_KEY = "roles";
export const Roles = (...roles: AdminRoleType[]) =>
  SetMetadata(ROLES_KEY, roles);
