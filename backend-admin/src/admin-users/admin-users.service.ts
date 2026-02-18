import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { CreateAdminUserDto } from "@stashy/shared/admin/dto/admin-user/create-admin-user.dto";
import type { AdminRoleType } from "@stashy/shared/admin/entities/admin-user.entity";
import * as bcrypt from "bcrypt";
import { AdminUsersRepository } from "./admin-users.repository";

@Injectable()
export class AdminUsersService {
  constructor(private readonly adminUserRepository: AdminUsersRepository) {}

  async findByUsername(username: string) {
    return await this.adminUserRepository.findByUserName(username);
  }

  async findById(id: string) {
    return await this.adminUserRepository.findById(id);
  }

  async findAll() {
    return await this.adminUserRepository.findAll();
  }

  async create(dto: CreateAdminUserDto) {
    const existing = await this.findByUsername(dto.username);
    if (existing) {
      throw new ConflictException("Username already exists");
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const result = await this.adminUserRepository.insert({
      username: dto.username,
      password: hashedPassword,
      role: dto.role,
    });
    return result[0];
  }

  async updateRole(adminId: string, role: AdminRoleType) {
    const admin = await this.findById(adminId);
    if (!admin) {
      throw new NotFoundException("Admin user not found");
    }

    if (admin.username === "admin") {
      throw new ForbiddenException("Cannot change role of the super admin");
    }

    await this.adminUserRepository.updateRole(adminId, role);
    return this.findById(adminId);
  }

  async updatePassword(adminId: string, hashedPassword: string) {
    const admin = await this.findById(adminId);
    if (!admin) {
      throw new NotFoundException("Admin user not found");
    }

    await this.adminUserRepository.updatePassword(adminId, hashedPassword);
    return this.findById(adminId);
  }

  async updateLastLogin(adminId: string): Promise<void> {
    const now = new Date();
    await this.adminUserRepository.updateLastLogin(adminId, now);
  }
}
