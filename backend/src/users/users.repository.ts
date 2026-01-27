import { Injectable, Scope } from "@nestjs/common";
import { generateId, TABLES, User } from "@stashy/shared";
import { UserSelect } from "@stashy/shared/entities/user.entity";
import { BaseRepository } from "../common/database/base.repository";

@Injectable({ scope: Scope.TRANSIENT })
export class UsersRepository extends BaseRepository {
  private tableName = TABLES.USERS;

  findById(id: string) {
    return this.query(this.tableName).select<User>(UserSelect).where({ id }).first();
  }

  findByGoogleId(googleId: string) {
    return this.query(this.tableName)
      .select<User>(UserSelect)
      .where({ google_id: googleId })
      .first();
  }

  findByEmail(email: string) {
    return this.query(this.tableName).select<User>(UserSelect).where({ email }).first();
  }

  findByNickname(nickname: string) {
    return this.query(this.tableName).select<User>(UserSelect).where({ nickname }).first();
  }

  async updateNickname(userId: string, nickname: string): Promise<User> {
    const [result] = await this.knex(this.tableName)
      .update({ nickname })
      .where({ id: userId })
      .returning([
        "id",
        "google_id as googleId",
        "email",
        "nickname",
        "profile_picture as profilePicture",
        "created_at as createdAt",
        "updated_at as updatedAt",
        "deleted_at as deletedAt",
      ]);
    return result;
  }

  async updateProfile(
    userId: string,
    updates: { nickname?: string; bio?: string; profilePicture?: string },
  ): Promise<User> {
    const dbUpdates: any = { ...updates };
    if (updates.profilePicture) {
      dbUpdates.profile_picture = updates.profilePicture;
      delete dbUpdates.profilePicture;
    }
    Object.keys(dbUpdates).forEach((key) => {
      if (dbUpdates[key] === undefined) delete dbUpdates[key];
    });

    if (Object.keys(dbUpdates).length === 0) {
      return this.findById(userId) as Promise<User>;
    }

    const [result] = await this.knex(this.tableName)
      .update(dbUpdates)
      .where({ id: userId })
      .returning([
        "id",
        "google_id as googleId",
        "email",
        "nickname",
        "bio",
        "profile_picture as profilePicture",
        "created_at as createdAt",
        "updated_at as updatedAt",
        "deleted_at as deletedAt",
      ]);
    return result;
  }

  insert(data: Partial<User>): Promise<User> {
    const now = new Date();
    return this.knex(this.tableName)
      .insert({
        id: data.id || generateId(),
        google_id: data.googleId || null,
        email: data.email,
        nickname: data.nickname,
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
      ]);
  }
}
