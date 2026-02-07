import { Injectable, Scope } from "@nestjs/common";
import { generateId, TABLES } from "@stashy/shared";
import { BaseRepository } from "../common/database/base.repository";
import type { Word } from "../words/entities/word.entity";

@Injectable({ scope: Scope.TRANSIENT })
export class FeedRepository extends BaseRepository {
  createTerm(term: string) {
    return this.knex(TABLES.TERMS).insert({ text: term }).returning(["number"]);
  }

  findTerm(term: string) {
    return this.knex(TABLES.TERMS).where("text", term).first();
  }

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

  findUserFeeds(userId: string, withPrivate: boolean, limit: number, cursor?: string) {
    const baseQuery = this.query({
      [TABLES.DEFINITIONS]: TABLES.DEFINITIONS_LIKE_VIEW,
    })
      .leftJoin(TABLES.USERS, "definitions.user_id", "users.id")
      .leftJoin(TABLES.WORDS, "definitions.word_id", "words.id")
      .leftJoin(TABLES.TERMS, "words.term", "terms.text")
      .where("definitions.user_id", userId)
      .whereNull("words.deleted_at");

    if (cursor) {
      baseQuery.where("definitions.created_at", "<", cursor);
    }
    if (withPrivate === false) {
      baseQuery.where("definitions.is_public", true);
    }

    return baseQuery
      .clone()
      .select({
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
        termNumber: "terms.number",
        tags: "definitions.tags",
      })
      .limit(limit)
      .orderBy("definitions.created_at", "desc");
  }

  findFeeds(userIds: string[], limit: number, cursor?: string) {
    const baseQuery = this.query({
      [TABLES.DEFINITIONS]: TABLES.DEFINITIONS_LIKE_VIEW,
    })
      .leftJoin(TABLES.USERS, "definitions.user_id", "users.id")
      .leftJoin(TABLES.WORDS, "definitions.word_id", "words.id")
      .leftJoin(TABLES.TERMS, "words.term", "terms.text")
      .whereIn("definitions.user_id", userIds)
      .whereNull("words.deleted_at")
      .where("definitions.is_public", true);

    if (cursor) {
      baseQuery.where("definitions.created_at", "<", cursor);
    }

    return baseQuery
      .select({
        id: "definitions.id",
        content: "definitions.content",
        wordId: "definitions.word_id",
        userId: "definitions.user_id",
        createdAt: "definitions.created_at",
        updatedAt: "definitions.updated_at",
        nickname: "users.nickname",
        profilePicture: "users.profile_picture",
        tags: "definitions.tags",
        term: "words.term",
        termNumber: "terms.number",
      })
      .limit(limit)
      .orderBy("definitions.created_at", "desc");
  }

  findAllFeeds(myUserId: string, limit: number, cursor?: string) {
    const query = this.query({
      [TABLES.DEFINITIONS]: TABLES.DEFINITIONS_LIKE_VIEW,
    })
      .leftJoin(TABLES.USERS, "definitions.user_id", "users.id")
      .leftJoin(TABLES.WORDS, "definitions.word_id", "words.id")
      .leftJoin(TABLES.TERMS, "words.term", "terms.text")
      .whereNull("words.deleted_at")
      .andWhere("definitions.is_public", true);

    if (cursor) {
      query.where("definitions.created_at", "<", cursor);
    }

    return query.limit(limit).orderBy("definitions.created_at", "desc").select({
      id: "definitions.id",
      content: "definitions.content",
      wordId: "definitions.word_id",
      userId: "definitions.user_id",
      createdAt: "definitions.created_at",
      updatedAt: "definitions.updated_at",
      nickname: "users.nickname",
      profilePicture: "users.profile_picture",
      term: "words.term",
      tags: "definitions.tags",
      termNumber: "terms.number",
    });
  }

  findRecommendations(limit: number, cursor?: string, excludeUserId?: string) {
    const query = this.query({
      [TABLES.DEFINITIONS]: TABLES.DEFINITIONS_LIKE_VIEW,
    })
      .leftJoin(TABLES.USERS, "definitions.user_id", "users.id")
      .leftJoin(TABLES.WORDS, "definitions.word_id", "words.id")
      .leftJoin(TABLES.TERMS, "words.term", "terms.text")
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
      .select({
        id: "definitions.id",
        content: "definitions.content",
        wordId: "definitions.word_id",
        userId: "definitions.user_id",
        createdAt: "definitions.created_at",
        updatedAt: "definitions.updated_at",
        nickname: "users.nickname",
        profilePicture: "users.profile_picture",
        term: "words.term",
        termNumber: "terms.number",
      });
  }

  findWordByTerm(userId: string, term: string) {
    return this.query(TABLES.WORDS)
      .leftJoin(TABLES.TERMS, `${TABLES.WORDS}.term`, `${TABLES.TERMS}.text`)
      .select({
        id: `${TABLES.WORDS}.id`,
        term: `${TABLES.WORDS}.term`,
        userId: `${TABLES.WORDS}.user_id`,
        createdAt: `${TABLES.WORDS}.created_at`,
        updatedAt: `${TABLES.WORDS}.updated_at`,
        deletedAt: `${TABLES.WORDS}.deleted_at`,
        termNumber: `${TABLES.TERMS}.number`,
      })
      .where({ [`${TABLES.WORDS}.user_id`]: userId, [`${TABLES.WORDS}.term`]: term })
      .first();
  }

  findFeedByTerm(term: string, limit: number, cursor?: string) {
    const query = this.query({
      [TABLES.DEFINITIONS]: TABLES.DEFINITIONS_LIKE_VIEW,
    })
      .leftJoin(TABLES.USERS, "definitions.user_id", "users.id")
      .leftJoin(TABLES.WORDS, "definitions.word_id", "words.id")
      .leftJoin(TABLES.TERMS, "words.term", "terms.text")
      .whereNull("words.deleted_at")
      .whereNull("users.deleted_at")
      .where("definitions.is_public", true)
      .where("words.term", "ilike", `%${term}%`);

    if (cursor) {
      query.where("definitions.created_at", "<", cursor);
    }

    return query.limit(limit).orderBy("definitions.created_at", "desc").select({
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
      termNumber: "terms.number",
      tags: "definitions.tags",
    });
  }

  findFeedsByTag(tag: string, limit: number, cursor?: string) {
    const query = this.query({
      [TABLES.DEFINITIONS]: TABLES.DEFINITIONS_LIKE_VIEW,
    })
      .leftJoin(TABLES.USERS, "definitions.user_id", "users.id")
      .leftJoin(TABLES.WORDS, "definitions.word_id", "words.id")
      .leftJoin(TABLES.TERMS, "words.term", "terms.text")
      .whereNull("words.deleted_at")
      .whereNull("users.deleted_at")
      .where("definitions.is_public", true)
      .whereRaw(`? = ANY(definitions.tags)`, [tag]);

    if (cursor) {
      query.where("definitions.created_at", "<", cursor);
    }

    return query
      .limit(limit)
      .orderBy("definitions.created_at", "desc")
      .select({
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
        termNumber: "terms.number",
        tags: this.knex.raw("array_to_json(definitions.tags)"),
      });
  }
}
