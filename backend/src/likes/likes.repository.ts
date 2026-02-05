import { Injectable, Scope } from "@nestjs/common";
import { generateId, TABLES } from "@stashy/shared";
import { BaseRepository } from "../common/database/base.repository";
import { Like, LikeSelect } from "./entities/like.entity";

@Injectable({ scope: Scope.TRANSIENT })
export class LikesRepository extends BaseRepository {
  private tableName = TABLES.LIKES;
  /**
   * Find all words by user ID
   */
  findByUserIdAndDefinitionIdWithDeleted(userId: string, definitionId: string) {
    return this.knex(this.tableName)
      .select<Like>(LikeSelect)
      .where({ user_id: userId, definition_id: definitionId })
      .first();
  }

  findByDefinitionId(definitionId: string) {
    return this.query(this.tableName)
      .select<Like[]>(LikeSelect)
      .where({ definition_id: definitionId });
  }

  findByDefinitionIds(definitionId: string) {
    return this.query(this.tableName)
      .select<Like[]>(LikeSelect)
      .where({ definition_id: definitionId });
  }

  findLikeInfoByDefinitionIds(
    definitionIds: string[],
    userId?: string,
  ): Promise<{ definitionId: string; isLiked: any; likeCount: number }[]> {
    return this.query({
      [TABLES.DEFINITIONS]: TABLES.DEFINITIONS_LIKE_VIEW,
    })
      .leftJoin(TABLES.LIKES, (on) => {
        on.on("definitions.id", "=", "likes.definition_id");
        if (userId) {
          on.andOnVal("likes.user_id", "=", userId);
        }
        on.andOnNull("likes.deleted_at");
      })
      .whereIn("definitions.id", definitionIds)
      .select<{ definitionId: string; isLiked: any; likeCount: any }[]>({
        definitionId: "definitions.id",
        likeCount: "definitions.likes_count",
        isLiked: this.knex.raw("?? IS NOT NULL", ["likes.id"]),
      });
  }

  delete(id: string) {
    return this.softDelete(this.tableName, id);
  }

  restore(id: string) {
    return this.undelete(this.tableName, id);
  }

  create(like: Partial<Like>) {
    const now = new Date();
    return this.knex(this.tableName).insert({
      id: generateId(),
      user_id: like.userId,
      definition_id: like.definitionId,
      created_at: now,
      updated_at: now,
    });
  }
}
