import { Injectable } from "@nestjs/common";
import { generateId } from "@stashy/shared";
import { UserInsert } from "@stashy/shared/entities/user.entity";
import { Users } from "@stashy/shared/types/db_entity.generated";
import { BaseRepository } from "../common/database/base.repository";

@Injectable()
export class UsersRepository extends BaseRepository {
  private readonly userSelect = {
    id: "id",
    googleId: "google_id",
    email: "email",
    nickname: "nickname",
    profilePicture: "profile_picture",
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    suspendedAt: "suspended_at",
  };

  findUsers(offset: number, limit: number) {
    const listQuery = this.knex("users")
      .select<Users[]>(this.userSelect)
      .whereNull("deleted_at")
      .offset(offset)
      .limit(limit)
      .orderBy("created_at", "desc");

    const countQuery = this.knex("users")
      .whereNull("deleted_at")
      .count<{ count: number }>("* as count")
      .first();

    return { listQuery, countQuery };
  }

  async findByEmail(email: string): Promise<Users | null> {
    return this.knex("users")
      .select<Users>(this.userSelect)
      .where({ email })
      .whereNull("deleted_at")
      .first();
  }

  async findByNickname(nickname: string): Promise<Users | null> {
    return this.knex("users")
      .select<Users>(this.userSelect)
      .where({ nickname })
      .whereNull("deleted_at")
      .first();
  }

  async findById(id: string): Promise<Users | null> {
    return this.knex("users")
      .select<Users>(this.userSelect)
      .where({ id })
      .whereNull("deleted_at")
      .first();
  }

  async insert(data: UserInsert): Promise<Users> {
    const now = new Date();
    const [result] = await this.knex("users")
      .insert({
        id: generateId(),
        email: data.email,
        nickname: data.nickname,
        google_id: data.googleId || null,
        profile_picture: data.profilePicture || null,
        created_at: now,
        updated_at: now,
      })
      .returning([
        "id",
        "google_id as googleId",
        "email",
        "nickname",
        "profile_picture as profilePicture",
        "created_at as createdAt",
        "updated_at as updatedAt",
        "deleted_at as deletedAt",
        "suspended_at as suspendedAt",
      ]);
    return result;
  }

  async updateStatus(id: string, suspendedAt: Date | null): Promise<Users> {
    const [result] = await this.knex("users")
      .where({ id })
      .update({
        suspended_at: suspendedAt,
        updated_at: new Date(),
      })
      .returning([
        "id",
        "google_id as googleId",
        "email",
        "nickname",
        "profile_picture as profilePicture",
        "created_at as createdAt",
        "updated_at as updatedAt",
        "deleted_at as deletedAt",
        "suspended_at as suspendedAt",
      ]);
    return result;
  }
}
