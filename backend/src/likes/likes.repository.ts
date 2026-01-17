import { Injectable } from "@nestjs/common";
import { TABLES } from "@shared";
import { BaseRepository } from "../common/database/base.repository";
import { Like, LikeSelect } from "./entities/like.entity";

@Injectable()
export class LikesRepository extends BaseRepository {
  private tableName = TABLES.LIKES;
  /**
   * Find all words by user ID
   */
  findByUserIdAndDefinitionId(userId: string, definitionId: string): Promise<Like> {
    return this.query(this.tableName)
      .select<Like>(LikeSelect)
      .where({ user_id: userId, definition_id: definitionId })
      .first();
  }

  findByDefinitionId(definitionId: string): Promise<Like[]> {
    return this.query(this.tableName)
      .select<Like[]>(LikeSelect)
      .where({ definition_id: definitionId });
  }

  delete(id: string): Promise<void> {
    return this.softDelete(this.tableName, id);
  }

  create(like: Partial<Like>): Promise<Like> {
    const now = new Date();
    return this.knex(this.tableName).insert({
      id: like.id,
      user_id: like.userId,
      definition_id: like.definitionId,
      created_at: now,
      updated_at: now,
    });
  }
}
