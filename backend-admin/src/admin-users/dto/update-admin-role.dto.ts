import { IsEnum } from "class-validator";
import { AdminRole, type AdminRoleType } from "../entities/admin-user.entity";

export class UpdateAdminRoleDto {
  @IsEnum([AdminRole.DEVELOPER, AdminRole.OPERATOR])
  role: Exclude<AdminRoleType, "super_admin">;
}
