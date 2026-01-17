import { Injectable } from "@nestjs/common";
import { TABLES, User } from "@shared";
import { UserInsert } from "@shared/entities/user.entity";
import { BaseRepository } from "../common/database/base.repository";

@Injectable()
export class UsersRepository extends BaseRepository {
  private tableName = TABLES.USERS;

  findUsers(offset: number, limit: number) {
    const listQuery = this.knex(this.tableName)
      .select<User[]>({
        id: "id",
        email: "email",
        nickname: "nickname",
        profilePicture: "profile_picture",
        createdAt: "created_at",
        updatedAt: "updated_at",
      })
      .whereNull("deleted_at")
      .offset(offset)
      .limit(limit)
      .orderBy("created_at", "desc");

    const countQuery = this.knex(this.tableName)
      .whereNull("deleted_at")
      .count<{ count: number }>("* as count")
      .first();

    return { listQuery, countQuery };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.knex(this.tableName)
      .select<User>({
        id: "id",
        email: "email",
        nickname: "nickname",
        profilePicture: "profile_picture",
        createdAt: "created_at",
        updatedAt: "updated_at",
      })
      .where({ email })
      .whereNull("deleted_at")
      .first();
  }

  async findByNickname(nickname: string): Promise<User | null> {
    return this.knex(this.tableName)
      .select<User>({
        id: "id",
        email: "email",
        nickname: "nickname",
        profilePicture: "profile_picture",
        createdAt: "created_at",
        updatedAt: "updated_at",
      })
      .where({ nickname })
      .whereNull("deleted_at")
      .first();
  }

  async insert(data: UserInsert): Promise<User> {
    const now = new Date();
    const [result] = await this.knex(this.tableName)
      .insert({
        email: data.email,
        nickname: data.nickname,
        google_id: data.googleId || null,
        profile_picture: data.profilePicture || null,
        created_at: now,
        updated_at: now,
      })
      .returning([
        "id",
        "email",
        "nickname",
        "profile_picture as profilePicture",
        "created_at as createdAt",
        "updated_at as updatedAt",
      ]);
    return result;
  }
}
