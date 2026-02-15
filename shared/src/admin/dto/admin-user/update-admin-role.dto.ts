import { IsEnum } from "class-validator";

const assignableAdminRoles = ["developer", "operator"] as const;

export type AssignableAdminRole = (typeof assignableAdminRoles)[number];

export class UpdateAdminRoleDto {
  @IsEnum(assignableAdminRoles)
  role: AssignableAdminRole;
}
