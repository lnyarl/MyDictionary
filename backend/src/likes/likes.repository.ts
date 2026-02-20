import { Injectable, Scope } from "@nestjs/common";
import { generateId } from "@stashy/shared";
import { Likes } from "@stashy/shared/types/db_entity.generated";
import { BaseRepository } from "../common/database/base.repository";
import { LikeSelect } from "./entities/like.entity";

@Injectable({ scope: Scope.TRANSIENT })
export class LikesRepository extends BaseRepository {
  /**
   * Find all words by user ID
   */
  findByUserIdAndDefinitionIdWithDeleted(userId: string, definitionId: string) {
    return this.knex("likes")
      .select<Likes>(LikeSelect)
      .where({ user_id: userId, definition_id: definitionId })
      .first();
  }

  findByDefinitionId(definitionId: string) {
    return this.query("likes").select<Likes[]>(LikeSelect).where({ definition_id: definitionId });
  }

  findByDefinitionIds(definitionId: string) {
    return this.query("likes").select<Likes[]>(LikeSelect).where({ definition_id: definitionId });
  }

  findLikeInfoByDefinitionIds(
    definitionIds: string[],
    userId?: string,
  ): Promise<{ definitionId: string; isLiked: any; likesCount: number }[]> {
    return this.query("vw_definitions_with_likes as definitions")
      .leftJoin("likes", (on) => {
        on.on("definitions.id", "=", "likes.definition_id");
        if (userId) {
          on.andOnVal("likes.user_id", "=", userId);
        }
        on.andOnNull("likes.deleted_at");
      })
      .whereIn("definitions.id", definitionIds)
      .select<{ definitionId: string; isLiked: boolean; likesCount: number }[]>({
        definitionId: "definitions.id",
        likesCount: "definitions.likes_count",
        isLiked: this.knex.raw("?? IS NOT NULL", ["likes.id"]) as any,
      });
  }

  remove(id: string) {
    return this.softDelete("likes", id);
  }

  restore(id: string) {
    return this.undelete("likes", id);
  }

  create(like: Partial<Likes>) {
    const now = new Date();
    return this.knex("likes").insert({
      id: generateId(),
      user_id: like.userId,
      definition_id: like.definitionId,
      created_at: now,
      updated_at: now,
    });
  }
}
