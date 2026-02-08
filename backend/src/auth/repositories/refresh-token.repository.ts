import { Injectable } from "@nestjs/common";
import { generateId, TABLES } from "@stashy/shared";
import { BaseRepository } from "../../common/database/base.repository";
import type { RefreshToken } from "../entities/refresh-token.entity";

@Injectable()
export class RefreshTokenRepository extends BaseRepository {
  async create(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    const [record] = await this.knex(TABLES.REFRESH_TOKENS)
      .insert({
        id: generateId(),
        user_id: userId,
        token,
        expires_at: expiresAt,
      })
      .returning("*");

    return record;
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const record = await this.query(TABLES.REFRESH_TOKENS)
      .where({ token })
      .where("expires_at", ">", new Date())
      .first();

    return record ?? null;
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    return this.query(TABLES.REFRESH_TOKENS).where({ user_id: userId });
  }

  async deleteById(id: string): Promise<void> {
    await this.query(TABLES.REFRESH_TOKENS).where({ id }).update({
      deleted_at: new Date(),
    });
  }

  async deleteByToken(token: string): Promise<void> {
    await this.query(TABLES.REFRESH_TOKENS).where({ token }).update({
      deleted_at: new Date(),
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.query(TABLES.REFRESH_TOKENS).where({ user_id: userId }).update({
      deleted_at: new Date(),
    });
  }

  async deleteExpired(): Promise<void> {
    await this.query(TABLES.REFRESH_TOKENS, true).where("expires_at", "<", new Date()).update({
      deleted_at: new Date(),
    });
  }
}
