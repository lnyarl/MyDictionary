import { Injectable } from "@nestjs/common";
import { generateId } from "@stashy/shared";
import { UserLoginStreaks } from "@stashy/shared/types/db_entity.generated";
import { BaseRepository } from "../common/database/base.repository";

@Injectable()
export class LoginStreaksRepository extends BaseRepository {
  findByUserId(userId: string) {
    return this.query("user_login_streaks")
      .where({ user_id: userId })
      .select<UserLoginStreaks>({
        id: "id",
        userid: "user_id",
        currentStreak: "current_streak",
        longestStreak: "longest_streak",
        lastLoginAt: "last_login_at",
        createdAt: "created_at",
        updatedAt: "updated_at",
      })
      .first();
  }

  create(userId: string, loginDate: Date) {
    return this.knex("user_login_streaks").insert({
      id: generateId(),
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_login_at: loginDate,
    });
  }

  updateStreak(userId: string, currentStreak: number, longestStreak: number, loginDate: Date) {
    return this.knex("user_login_streaks").where({ user_id: userId }).update({
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_login_at: loginDate,
      updated_at: new Date(),
    });
  }
}
