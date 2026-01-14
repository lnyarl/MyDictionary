import { Injectable, NotFoundException } from "@nestjs/common";
import { AdminUsersRepository } from "./admin-users.repository";
import { AdminUser } from "./entities/admin-user.entity";

@Injectable()
export class AdminUsersService {
  constructor(private readonly adminUserRepository: AdminUsersRepository) {}

  async findByUsername(username: string): Promise<AdminUser | null> {
    return await this.adminUserRepository.findByUserName(username);
  }

  async findById(id: string): Promise<AdminUser | null> {
    return await this.adminUserRepository.findById(id);
  }

  async updatePassword(adminId: string, hashedPassword: string): Promise<AdminUser> {
    const admin = await this.findById(adminId);
    if (!admin) {
      throw new NotFoundException("Admin user not found");
    }

    return await this.adminUserRepository.updatePassword(adminId, hashedPassword);
  }

  async updateLastLogin(adminId: string): Promise<void> {
    const now = new Date();
    await this.adminUserRepository.updateLastLogin(adminId, now);
  }
}
