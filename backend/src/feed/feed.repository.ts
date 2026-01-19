import { Injectable } from "@nestjs/common";
import { TABLES } from "@shared";
import { BaseRepository } from "../common/database/base.repository";
import { Feed } from "./entities/feed.entity";

@Injectable()
export class FeedRepository extends BaseRepository {
  findFeeds(userIds: string[], offset: number, limit: number) {
    return this.query({ [TABLES.DEFINITIONS]: TABLES.DEFINITIONS_LIKE_VIEW })
      .leftJoin(TABLES.USERS, "definitions.user_id", "users.id")
      .leftJoin(TABLES.WORDS, "definitions.word_id", "words.id")
      .whereIn("definitions.user_id", userIds)
      .whereNull("words.deleted_at")
      .where("words.is_public", true)
      .limit(limit)
      .offset(offset)
      .orderBy("definitions.created_at", "desc")
      .select<Feed[]>({
        id: "definitions.id",
        content: "definitions.content",
        wordId: "definitions.word_id",
        userId: "definitions.user_id",
        likesCount: "definitions.likes_count",
        createdAt: "definitions.created_at",
        updatedAt: "definitions.updated_at",
        nickname: "users.nickname",
        profilePicture: "users.profile_picture",
        term: "words.term",
      });
  }

  findRecommendations(offset: number, limit: number, excludeUserId?: string) {
    const query = this.query({ [TABLES.DEFINITIONS]: TABLES.DEFINITIONS_LIKE_VIEW })
      .leftJoin(TABLES.USERS, "definitions.user_id", "users.id")
      .leftJoin(TABLES.WORDS, "definitions.word_id", "words.id")
      .whereNull("words.deleted_at")
      .whereNull("users.deleted_at")
      .where("words.is_public", true)
      .offset(offset)
      .limit(limit)
      .orderBy("definitions.likes_count", "desc")
      .orderBy("definitions.created_at", "desc")
      .select<Feed[]>({
        id: "definitions.id",
        content: "definitions.content",
        wordId: "definitions.word_id",
        userId: "definitions.user_id",
        likesCount: "definitions.likes_count",
        createdAt: "definitions.created_at",
        updatedAt: "definitions.updated_at",
        nickname: "users.nickname",
        profilePicture: "users.profile_picture",
        term: "words.term",
      });

    if (excludeUserId) {
      query.whereNot("definitions.user_id", excludeUserId);
    }

    return query;
  }
}
