import { Injectable, Scope } from "@nestjs/common";
import { generateId, TABLES } from "@stashy/shared";
import { BaseRepository } from "../common/database/base.repository";
import { Word } from "../words/entities/word.entity";
import { Feed } from "./entities/feed.entity";

@Injectable({ scope: Scope.TRANSIENT })
export class FeedRepository extends BaseRepository {
  createWord(word: Omit<Word, "id" | "createdAt" | "updatedAt" | "deletedAt">) {
    const now = new Date();
    return this.knex(TABLES.WORDS)
      .insert({
        id: generateId(),
        term: word.term,
        user_id: word.userId,
        created_at: now,
        updated_at: now,
      })
      .returning([
        "id",
        "term",
        "user_id as userId",
        "created_at as createdAt",
        "updated_at as updatedAt",
        "deleted_at as deletedAt",
      ]);
  }

  findMyFeeds(userId: string, limit: number, cursor?: string) {
    const baseQuery = this.query({ [TABLES.DEFINITIONS]: TABLES.DEFINITIONS_LIKE_VIEW })
      .leftJoin(TABLES.USERS, "definitions.user_id", "users.id")
      .leftJoin(TABLES.WORDS, "definitions.word_id", "words.id")
      .where("definitions.user_id", userId)
      .whereNull("words.deleted_at");

    if (cursor) {
      baseQuery.where("definitions.created_at", "<", cursor);
    }

    const listQuery = baseQuery
      .clone()
      .select<Feed[]>({
        id: "definitions.id",
        content: "definitions.content",
        wordId: "definitions.word_id",
        userId: "definitions.user_id",
        likesCount: "definitions.likes_count",
        createdAt: "definitions.created_at",
        updatedAt: "definitions.updated_at",
        nickname: "users.nickname",
        isPublic: "definitions.is_public",
        profilePicture: "users.profile_picture",
        term: "words.term",
        tags: "definitions.tags",
      })
      .limit(limit)
      .orderBy("definitions.created_at", "desc");

    return listQuery;
  }

  findFeeds(userIds: string[], limit: number, cursor?: string) {
    const baseQuery = this.query({ [TABLES.DEFINITIONS]: TABLES.DEFINITIONS_LIKE_VIEW })
      .leftJoin(TABLES.USERS, "definitions.user_id", "users.id")
      .leftJoin(TABLES.WORDS, "definitions.word_id", "words.id")
      .whereIn("definitions.user_id", userIds)
      .whereNull("words.deleted_at")
      .where("definitions.is_public", true);

    if (cursor) {
      baseQuery.where("definitions.created_at", "<", cursor);
    }

    const listQuery = baseQuery
      .clone()
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
        tags: "definitions.tags",
        term: "words.term",
      })
      .limit(limit)
      .orderBy("definitions.created_at", "desc");

    return listQuery;
  }

  findAllFeeds(limit: number, cursor?: string) {
    console.log("Find all feeds called with limit:", limit, "cursor:", cursor);
    const query = this.query({ [TABLES.DEFINITIONS]: TABLES.DEFINITIONS_LIKE_VIEW })
      .leftJoin(TABLES.USERS, "definitions.user_id", "users.id")
      .leftJoin(TABLES.WORDS, "definitions.word_id", "words.id")
      .whereNull("words.deleted_at")
      .where("definitions.is_public", true);

    if (cursor) {
      query.where("definitions.created_at", "<", cursor);
    }

    return query.limit(limit).orderBy("definitions.created_at", "desc").select<Feed[]>({
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

  findRecommendations(limit: number, cursor?: string, excludeUserId?: string) {
    const query = this.query({ [TABLES.DEFINITIONS]: TABLES.DEFINITIONS_LIKE_VIEW })
      .leftJoin(TABLES.USERS, "definitions.user_id", "users.id")
      .leftJoin(TABLES.WORDS, "definitions.word_id", "words.id")
      .whereNull("words.deleted_at")
      .whereNull("users.deleted_at")
      .where("definitions.is_public", true);

    if (cursor) {
      query.where("definitions.created_at", "<", cursor);
    }

    if (excludeUserId) {
      query.whereNot("definitions.user_id", excludeUserId);
    }

    return query
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
  }

  findWordByTerm(userId: string, term: string) {
    return this.query(TABLES.WORDS)
      .select({
        id: "id",
        term: "term",
        userId: "user_id",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
      })
      .where({ user_id: userId, term })
      .first();
  }
}
