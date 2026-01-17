import { Injectable } from "@nestjs/common";
import { TABLES } from "@shared";
import { BaseRepository } from "../common/database/base.repository";
import type { AdminRoleType } from "./entities/admin-user.entity";

interface AdminUserRow {
  id: string;
  username: string;
  password: string;
  role: AdminRoleType;
  must_change_password: boolean;
  last_login: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

@Injectable()
export class AdminUsersRepository extends BaseRepository {
  private tableName = TABLES.ADMIN_USERS;

  private mapToEntity(row: AdminUserRow) {
    if (!row) return null;
    return {
      id: row.id,
      username: row.username,
      password: row.password,
      role: row.role,
      mustChangePassword: row.must_change_password,
      lastLogin: row.last_login,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at,
    };
  }

  async findById(id: string) {
    const row = await this.query(this.tableName).select<AdminUserRow>("*").where({ id }).first();
    return this.mapToEntity(row);
  }

  async findByUserName(username: string) {
    const row = await this.query(this.tableName)
      .select<AdminUserRow>("*")
      .where({ username })
      .first();
    return this.mapToEntity(row);
  }

  async findAll() {
    const rows = await this.query(this.tableName)
      .select<AdminUserRow[]>("*")
      .orderBy("created_at", "desc");
    return rows.map((row) => this.mapToEntity(row));
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

  async insert(data: { username: string; password: string; role: AdminRoleType }) {
    const now = new Date();
    const [row] = await this.knex(this.tableName)
      .insert({
        username: data.username,
        password: data.password,
        role: data.role,
        must_change_password: true,
        created_at: now,
        updated_at: now,
      })
      .returning<AdminUserRow[]>("*");
    return this.mapToEntity(row);
  }
}
