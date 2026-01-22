import { Injectable } from "@nestjs/common";
import { generateId, TABLES } from "@shared";
import { BaseRepository } from "../common/database/base.repository";
import { type AdminRoleType, AdminUser } from "./entities/admin-user.entity";

@Injectable()
export class AdminUsersRepository extends BaseRepository {
  private tableName = TABLES.ADMIN_USERS;

  private readonly adminUserSelect = {
    id: "id",
    username: "username",
    password: "password",
    role: "role",
    mustChangePassword: "must_change_password",
    lastLogin: "last_login",
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
  };

  findById(id: string) {
    return this.query(this.tableName).select<AdminUser>(this.adminUserSelect).where({ id }).first();
  }

  findByUserName(username: string) {
    return this.query(this.tableName)
      .select<AdminUser>(this.adminUserSelect)
      .where({ username })
      .first();
  }

  findAll() {
    return this.query(this.tableName)
      .select<AdminUser[]>(this.adminUserSelect)
      .orderBy("created_at", "desc");
  }

  updateLastLogin(adminId: string, now: Date) {
    return this.knex(this.tableName).where({ id: adminId }).update({ last_login: now });
  }

  updatePassword(adminId: string, hashedPassword: string, mustChangePassword = false) {
    return this.knex(this.tableName)
      .where({ id: adminId })
      .update({ password: hashedPassword, must_change_password: mustChangePassword });
  }

  updateRole(adminId: string, role: AdminRoleType) {
    return this.knex(this.tableName)
      .where({ id: adminId })
      .whereNot({ username: "admin" })
      .update({ role, updated_at: new Date() });
  }

  insert(data: { username: string; password: string; role: AdminRoleType }) {
    const now = new Date();
    return this.knex(this.tableName)
      .insert({
        id: generateId(),
        username: data.username,
        password: data.password,
        role: data.role,
        must_change_password: true,
        created_at: now,
        updated_at: now,
      })
      .returning<AdminUser[]>([
        "id",
        "username",
        "password",
        "role",
        "must_change_password as mustChangePassword",
        "last_login as lastLogin",
        "created_at as createdAt",
        "updated_at as updatedAt",
        "deleted_at as deletedAt",
      ]);
  }
}
