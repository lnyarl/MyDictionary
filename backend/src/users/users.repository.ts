import { Injectable, Scope } from "@nestjs/common";
import { generateId } from "@stashy/shared";
import { UserSelect } from "@stashy/shared/entities/user.entity";
import { Users } from "@stashy/shared/types/db_entity.generated";
import { BaseRepository } from "../common/database/base.repository";

@Injectable({ scope: Scope.TRANSIENT })
export class UsersRepository extends BaseRepository {
  findById(id: string) {
    return this.query("users").select<Users>(UserSelect).where({ id }).first();
  }

  findByGoogleId(googleId: string) {
    return this.query("users").select<Users>(UserSelect).where({ google_id: googleId }).first();
  }

  findByEmail(email: string) {
    return this.query("users").select<Users>(UserSelect).where({ email }).first();
  }

  findByNickname(nickname: string) {
    return this.query("users").select<Users>(UserSelect).where({ nickname }).first();
  }

  updateNickname(userId: string, nickname: string) {
    return this.knex("users")
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
  }

  async updateProfile(
    userId: string,
    updates: { nickname?: string; bio?: string; profilePicture?: string },
  ): Promise<Users> {
    const dbUpdates: { nickname?: string; bio?: string; profile_picture?: string } = { ...updates };
    if (updates.profilePicture) {
      dbUpdates.profile_picture = updates.profilePicture;
      delete dbUpdates.profilePicture;
    }
    Object.keys(dbUpdates).forEach((key) => {
      if (dbUpdates[key] === undefined) delete dbUpdates[key];
    });

    if (Object.keys(dbUpdates).length === 0) {
      return this.findById(userId) as Promise<Users>;
    }

    const [result] = await this.knex("users")
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

  insert(data: Partial<Users>): Promise<Users> {
    const now = new Date();
    return this.knex("users")
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
