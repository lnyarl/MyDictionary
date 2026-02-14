import { Injectable } from "@nestjs/common";
import { generateId } from "@stashy/shared";
import { RefreshTokens } from "@stashy/shared/types/db_entity.generated";
import { BaseRepository } from "../../common/database/base.repository";

@Injectable()
export class RefreshTokenRepository extends BaseRepository {
  create(userId: string, token: string, expiresAt: Date, fromAdmin = false) {
    return this.knex("refresh_tokens")
      .insert({
        id: generateId(),
        user_id: userId,
        token,
        expires_at: expiresAt,
        from_admin: fromAdmin,
      })
      .returning("*");
  }

  findByToken(token: string) {
    const record = this.query("refresh_tokens")
      .select<RefreshTokens>({
        id: "id",
        userId: "user_id",
        token: "token",
        expiresAt: "expires_at",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
        fromAdmin: "from_admin",
      })
      .where({ token })
      .where("expires_at", ">", new Date())
      .first();

    return record;
  }

  findByUserId(userId: string) {
    return this.query("refresh_tokens").where({ user_id: userId }).select<RefreshTokens>({
      id: "id",
      userId: "user_id",
      token: "token",
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      fromAdmin: "from_admin",
    });
  }

  deleteById(id: string) {
    return this.query("refresh_tokens").where({ id }).update({
      deleted_at: new Date(),
    });
  }

  deleteByToken(token: string) {
    return this.query("refresh_tokens").where({ token }).update({
      deleted_at: new Date(),
    });
  }

  deleteByUserId(userId: string) {
    return this.query("refresh_tokens").where({ user_id: userId }).update({
      deleted_at: new Date(),
    });
  }

  deleteExpired() {
    return this.query("refresh_tokens", true).where("expires_at", "<", new Date()).update({
      deleted_at: new Date(),
    });
  }
}
