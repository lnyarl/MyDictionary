import { IsEnum, IsString, MinLength } from "class-validator";

const assignableAdminRoles = ["developer", "operator"] as const;

export type AssignableAdminRole = (typeof assignableAdminRoles)[number];

export class CreateAdminUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(assignableAdminRoles)
  role: AssignableAdminRole;
}
