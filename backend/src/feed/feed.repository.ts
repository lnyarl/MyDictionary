import { Injectable, Scope } from "@nestjs/common";
import { generateId } from "@stashy/shared";
import { BaseRepository } from "../common/database/base.repository";
import type { Word } from "../words/entities/word.entity";
import { Feed } from "./entities/feed.entity";

@Injectable({ scope: Scope.TRANSIENT })
export class FeedRepository extends BaseRepository {
  createTerm(term: string) {
    return this.knex("terms").insert({ text: term }).returning(["number"]);
  }

  findTerm(term: string) {
    return this.knex("terms").where("text", term).first();
  }

  createWord(word: Omit<Word, "id" | "createdAt" | "updatedAt" | "deletedAt">) {
    const now = new Date();
    return this.knex("words")
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
    const baseQuery = this.query("vw_definitions_with_likes as definitions")
      .leftJoin("users", "definitions.user_id", "users.id")
      .leftJoin("words", "definitions.word_id", "words.id")
      .leftJoin("terms", "words.term", "terms.text")
      .where("definitions.user_id", userId)
      .whereNull("words.deleted_at");

    if (cursor) {
      baseQuery.where("definitions.created_at", "<", new Date(Number(cursor)));
    }
    if (withPrivate === false) {
      baseQuery.where("definitions.is_public", true);
    }

    return baseQuery
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
        termNumber: "terms.number",
        tags: "definitions.tags",
      })
      .limit(limit)
      .orderBy("definitions.created_at", "desc");
  }

  findFeeds(userIds: string[], limit: number, cursor?: string) {
    const baseQuery = this.query("definitions")
      .leftJoin("users", "definitions.user_id", "users.id")
      .leftJoin("words", "definitions.word_id", "words.id")
      .leftJoin("terms", "words.term", "terms.text")
      .whereIn("definitions.user_id", userIds)
      .whereNull("words.deleted_at")
      .where("definitions.is_public", true);

    if (cursor) {
      baseQuery.where("definitions.created_at", "<", new Date(Number(cursor)));
    }

    return baseQuery
      .select<Feed[]>({
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
    const query = this.query("definitions")
      .leftJoin("users", "definitions.user_id", "users.id")
      .leftJoin("words", "definitions.word_id", "words.id")
      .leftJoin("terms", "words.term", "terms.text")
      .whereNull("words.deleted_at")
      .andWhere("definitions.is_public", true);

    if (cursor) {
      query.where("definitions.created_at", "<", new Date(Number(cursor)));
    }

    return query.limit(limit).orderBy("definitions.created_at", "desc").select<Feed[]>({
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
    const query = this.query("vw_definitions_with_likes as definitions")
      .leftJoin("users", "definitions.user_id", "users.id")
      .leftJoin("words", "definitions.word_id", "words.id")
      .leftJoin("terms", "words.term", "terms.text")
      .whereNull("words.deleted_at")
      .whereNull("users.deleted_at")
      .where("definitions.is_public", true);

    if (cursor) {
      query.where("definitions.created_at", "<", new Date(Number(cursor)));
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
        createdAt: "definitions.created_at",
        updatedAt: "definitions.updated_at",
        nickname: "users.nickname",
        profilePicture: "users.profile_picture",
        term: "words.term",
        termNumber: "terms.number",
      });
  }

  findWordByTerm(userId: string, term: string) {
    return this.query("words")
      .leftJoin("terms", `words.term`, "terms.text")
      .select({
        id: `words.id`,
        term: `words.term`,
        userId: `words.user_id`,
        createdAt: `words.created_at`,
        updatedAt: `words.updated_at`,
        deletedAt: `words.deleted_at`,
        termNumber: `terms.number`,
      })
      .where({ "words.user_id": userId, "words.term": term })
      .first();
  }

  findFeedByTerm(term: string, limit: number, cursor?: string) {
    const query = this.query("vw_definitions_with_likes as definitions")
      .leftJoin("users", "definitions.user_id", "users.id")
      .leftJoin("words", "definitions.word_id", "words.id")
      .leftJoin("terms", "words.term", "terms.text")
      .whereNull("words.deleted_at")
      .whereNull("users.deleted_at")
      .where("definitions.is_public", true)
      .where("words.term", "ilike", `%${term}%`);

    if (cursor) {
      query.where("definitions.created_at", "<", new Date(Number(cursor)));
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
      // term: "words.term",
      termNumber: "terms.number",
      tags: "definitions.tags",
    });
  }

  findFeedsByTag(tag: string, limit: number, cursor?: string) {
    const query = this.query("vw_definitions_with_likes as definitions")
      .leftJoin("users", "definitions.user_id", "users.id")
      .leftJoin("words", "definitions.word_id", "words.id")
      .leftJoin("terms", "words.term", "terms.text")
      .whereNull("words.deleted_at")
      .whereNull("users.deleted_at")
      .where("definitions.is_public", true)
      .whereRaw(`? = ANY(definitions.tags)`, [tag]);

    if (cursor) {
      query.where("definitions.created_at", "<", new Date(Number(cursor)));
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
      termNumber: "terms.number",
      // tags: this.knex.raw("array_to_json(definitions.tags)"),
      tags: "definitions.tags",
    });
  }

  findLikedFeeds(userId: string, limit: number, cursor?: string) {
    const query = this.query("definitions")
      .leftJoin("likes", "definitions.id", "likes.definition_id")
      .leftJoin("users", "definitions.user_id", "users.id")
      .leftJoin("words", "definitions.word_id", "words.id")
      .leftJoin("terms", "words.term", "terms.text")
      .whereNull("words.deleted_at")
      .whereNull("users.deleted_at")
      .whereNull("likes.deleted_at")
      .where("definitions.is_public", true)
      .where("likes.user_id", userId);

    if (cursor) {
      query.where("definitions.created_at", "<", new Date(Number(cursor)));
    }

    return query.limit(limit).orderBy("definitions.created_at", "desc").select<Feed[]>({
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
      // tags: this.knex.raw("array_to_json(definitions.tags)"),
      tags: "definitions.tags",
    });
  }
}
