import { Inject, Injectable } from "@nestjs/common";
import { generateId, TABLES } from "@stashy/shared";
import { Knex } from "knex";
import { KNEX_CONNECTION } from "../common/database/knex.provider";

export type LoginStreak = {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastLoginAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class LoginStreaksRepository {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async findByUserId(userId: string): Promise<LoginStreak | null> {
    const result = await this.knex(TABLES.USER_LOGIN_STREAKS).where({ user_id: userId }).first();

    if (!result) {
      return null;
    }

    return this.mapToLoginStreak(result);
  }

  async create(userId: string, loginDate: Date): Promise<LoginStreak> {
    const [result] = await this.knex(TABLES.USER_LOGIN_STREAKS)
      .insert({
        id: generateId(),
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_login_at: loginDate,
      })
      .returning("*");

    return this.mapToLoginStreak(result);
  }

  async updateStreak(
    userId: string,
    currentStreak: number,
    longestStreak: number,
    loginDate: Date,
  ): Promise<LoginStreak> {
    const [result] = await this.knex(TABLES.USER_LOGIN_STREAKS)
      .where({ user_id: userId })
      .update({
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_login_at: loginDate,
        updated_at: new Date(),
      })
      .returning("*");

    return this.mapToLoginStreak(result);
  }

  private mapToLoginStreak(row: Record<string, unknown>): LoginStreak {
    return {
      userId: row.user_id as string,
      currentStreak: row.current_streak as number,
      longestStreak: row.longest_streak as number,
      lastLoginAt: new Date(row.last_login_at as string),
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    };
  }
}
