import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { CreateAdminUserDto } from "@stashy/shared/admin/dto/admin-user/create-admin-user.dto";
import { UpdateAdminRoleDto } from "@stashy/shared/admin/dto/admin-user/update-admin-role.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { AdminUsersService } from "./admin-users.service";
import { AdminRole } from "./entities/admin-user.entity";

@Controller()
@Roles(AdminRole.SUPER_ADMIN)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get("admin-users")
  async findAll() {
    const admins = await this.adminUsersService.findAll();
    return admins.map((admin) => ({
      id: admin.id,
      username: admin.username,
      role: admin.role,
      mustChangePassword: admin.mustChangePassword,
      lastLogin: admin.lastLogin,
      createdAt: admin.createdAt,
    }));
  }

  @Post("admin-users")
  async create(@Body() dto: CreateAdminUserDto) {
    const admin = await this.adminUsersService.create(dto);
    return {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      createdAt: admin.createdAt,
    };
  }

  @Patch("admin-users/:id/role")
  async updateRole(@Param("id") id: string, @Body() dto: UpdateAdminRoleDto) {
    const admin = await this.adminUsersService.updateRole(id, dto.role);
    return {
      id: admin.id,
      username: admin.username,
      role: admin.role,
    };
  }
}
