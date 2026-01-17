import { IsEnum, IsString, MinLength } from "class-validator";
import { AdminRole, type AdminRoleType } from "../entities/admin-user.entity";

export class CreateAdminUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum([AdminRole.DEVELOPER, AdminRole.OPERATOR])
  role: Exclude<AdminRoleType, "super_admin">;
}
