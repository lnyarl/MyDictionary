import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { AdminUser } from "@stashy/shared/admin/entities/admin-user.entity";
import { UserJwtPayload } from "@stashy/shared/dto/auth/type";
import { Users } from "@stashy/shared/types/db_entity.generated";
import * as bcrypt from "bcrypt";
import { AdminUsersService } from "../admin-users/admin-users.service";

export interface AdminJwtPayload {
  sub: string;
  username: string;
  mustChangePassword: boolean;
}

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async validateCredentials(
    username: string,
    password: string,
  ): Promise<AdminUser | null> {
    const admin = await this.adminUsersService.findByUsername(username);
    if (!admin) {
      return null;
    }

    const isValid = await this.comparePassword(password, admin.password);
    return isValid ? admin : null;
  }

  generateJwtToken(admin: AdminUser): string {
    const payload: AdminJwtPayload = {
      sub: admin.id,
      username: admin.username,
      mustChangePassword: admin.mustChangePassword,
    };

    return this.jwtService.sign(payload);
  }

  generateUserJwtToken(user: Users): string {
    const payload: UserJwtPayload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.sign(payload);
  }

  async changePassword(adminId: string, newPassword: string): Promise<void> {
    const hashedPassword = await this.hashPassword(newPassword);
    await this.adminUsersService.updatePassword(adminId, hashedPassword);
  }

  async updateLastLogin(adminId: string): Promise<void> {
    await this.adminUsersService.updateLastLogin(adminId);
  }
}
