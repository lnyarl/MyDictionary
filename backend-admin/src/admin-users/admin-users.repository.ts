import { Injectable } from "@nestjs/common";
import { TABLES } from "@shared";
import { BaseRepository } from "../common/database/base.repository";
import { AdminUser } from "./entities/admin-user.entity";

@Injectable()
export class AdminUsersRepository extends BaseRepository {
  private tableName = TABLES.ADMIN_USERS;

  findById(id: string) {
    return this.query(this.tableName).select<AdminUser>().where({ id }).first();
  }

  findByUserName(username: string) {
    return this.query(this.tableName).select<AdminUser>().where({ username }).first();
  }
  updateLastLogin(adminId: string, now: Date) {
    return this.knex(this.tableName).where({ id: adminId }).update({ last_login: now });
  }
  updatePassword(adminId: string, hashedPassword: string, mustChangePassword: boolean = false) {
    return this.knex(this.tableName)
      .where({ id: adminId })
      .update({ password: hashedPassword, must_change_password: mustChangePassword })
      .returning<AdminUser>("*");
  }

  insert(data: Partial<AdminUser>) {
    const now = new Date();
    return this.knex(this.tableName).insert({
      ...data,
      created_at: now,
      updated_at: now,
    });
  }
}
