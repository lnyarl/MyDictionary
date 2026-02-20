import { Injectable } from "@nestjs/common";
import { Definition, generateId } from "@stashy/shared";
import { BaseRepository } from "../common/database/base.repository";

@Injectable()
export class DefinitionsRepository extends BaseRepository {
  findByUserId(userId: string, limit: number, cursor?: string) {
    const baseQuery = this.query("definitions").where({ user_id: userId });

    if (cursor) {
      baseQuery.where("created_at", "<", new Date(Number(cursor)));
    }

    const listQuery = baseQuery
      .clone()
      .orderBy("created_at", "DESC")
      .select<Definition[]>({
        id: "definitions.id",
        content: "content",
        wordId: "word_id",
        termId: "term_id",
        userId: "definitions.user_id",
        isPublic: "definitions.is_public",
        tags: "tags",
        mediaUrls: "media_urls",
        createdAt: "definitions.created_at",
        updatedAt: "definitions.updated_at",
        deletedAt: "definitions.deleted_at",
      })
      .limit(limit);

    return listQuery;
  }

  getTermIdByTerm(term: string) {
    return this.query("terms").where({ text: term }).select<{ id: string }[]>("id");
  }

  findById(definitionId: string) {
    return this.query("definitions")
      .select<Definition>({
        id: "definitions.id",
        content: "content",
        wordId: "word_id",
        termId: "term_id",
        userId: "definitions.user_id",
        isPublic: "definitions.is_public",
        tags: "tags",
        mediaUrls: "media_urls",
        createdAt: "definitions.created_at",
        updatedAt: "definitions.updated_at",
        deletedAt: "definitions.deleted_at",
      })
      .where({ id: definitionId })
      .first();
  }

  findByWordIdAndUserId(wordId: string, userId: string) {
    return this.query("definitions")
      .select<Definition[]>({
        id: "definitions.id",
        content: "content",
        wordId: "word_id",
        termId: "term_id",
        userId: "definitions.user_id",
        isPublic: "definitions.is_public",
        tags: "tags",
        mediaUrls: "media_urls",
        createdAt: "definitions.created_at",
        updatedAt: "definitions.updated_at",
        deletedAt: "definitions.deleted_at",
      })
      .where({ word_id: wordId, user_id: userId })
      .orderBy("created_at", "desc");
  }

  findByIdWithPublic(definitionId: string) {
    return this.query("definitions")
      .leftJoin("words", `words.id`, `definitions.word_id`)
      .leftJoin("users", `users.id`, `definitions.user_id`)
      .select<
        Definition & {
          wordUserId: string;
          nickname: string;
          profilePicture: string;
          term: string;
        }
      >({
        id: `definitions.id`,
        wordId: `definitions.word_id`,
        term: "words.term",
        termId: `definitions.term_id`,
        userId: `definitions.user_id`,
        content: `definitions.content`,
        tags: `definitions.tags`,
        isPublic: `definitions.is_public`,
        mediaUrls: `definitions.media_urls`,
        createdAt: `definitions.created_at`,
        updatedAt: `definitions.updated_at`,
        wordUserId: `words.user_id`,
        nickname: "users.nickname",
        profilePicture: `users.profile_picture`,
      })
      .where({ "definitions.id": definitionId })
      .groupBy(`definitions.id`, `words.id`, "users.id")
      .first();
  }

  findByTerm(term: string, userId?: string) {
    const baseQuery = this.query("definitions")
      .innerJoin("words", `words.id`, `definitions.word_id`)
      .innerJoin("users", `users.id`, `definitions.user_id`)
      .where(`words.term`, `${term}`);

    if (userId) {
      baseQuery.where((builder) => {
        builder.where({ "definitions.is_public": true }).orWhere({ "definitions.user_id": userId });
      });
    } else {
      baseQuery.where({ "definitions.is_public": true });
    }

    return baseQuery
      .select<Definition[]>({
        id: "definitions.id",
        content: "content",
        wordId: "word_id",
        termId: "term_id",
        userId: "definitions.user_id",
        isPublic: "definitions.is_public",
        tags: "tags",
        mediaUrls: "media_urls",
        nickname: "users.nickname",
        profilePicture: "users.profile_picture",
        createdAt: "definitions.created_at",
        updatedAt: "definitions.updated_at",
        deletedAt: "definitions.deleted_at",
      })
      .orderBy(`definitions.created_at`, "DESC");
  }

  findAllByWordId(wordId: string) {
    return this.knex.raw(
      `
      SELECT 
        d.id, 
        d.word_id as wordId, 
        d.term_id as termId,
        d.user_id as userId, 
        d.content, 
        d.tags,
        d.media_urls as "mediaUrls",
        COALESCE(l.likes_count, 0) as "likesCount", 
        d.created_at as "createdAt", 
        d.updated_at as "updatedAt",
        u.nickname as nickname,
        u.profile_picture as "profilePicture"
      FROM definitions d
      LEFT JOIN (
        SELECT definition_id, COUNT(*) as likes_count
        FROM likes
        WHERE deleted_at IS NULL
        GROUP BY definition_id
      ) l ON d.id = l.definition_id
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.word_id = ? AND d.deleted_at IS NULL
      ORDER BY d.created_at DESC
      `,
      [wordId],
    );
  }

  getCountByUserId(userId: string) {
    return this.query("definitions")
      .where({ user_id: userId })
      .count<{ count: number }>("* as count")
      .first();
  }

  remove(id: string) {
    return this.softDelete("definitions", id);
  }

  create(definition: Partial<Definition>) {
    const now = new Date();
    const insertData: any = {
      id: definition.id || generateId(),
      word_id: definition.wordId,
      term_id: definition.termId,
      user_id: definition.userId,
      is_public: definition.isPublic,
      content: definition.content,
      created_at: now,
      updated_at: now,
      media_urls: JSON.stringify(definition.mediaUrls || []),
    };

    if (definition.tags && definition.tags.length > 0) {
      insertData.tags = definition.tags;
    } else {
      insertData.tags = this.knex.raw("'{}'::text[]");
    }

    return this.knex("definitions")
      .insert(insertData)
      .returning([
        "id",
        "word_id as wordId",
        "term_id as termId",
        "user_id as userId",
        "content",
        "tags",
        "media_urls as mediaUrls",
        "created_at as createdAt",
        "updated_at as updatedAt",
      ]);
  }

  updateDefinition(
    id: string,
    definition: Partial<
      Pick<Definition, "content" | "tags" | "mediaUrls" | "isPublic" | "createdAt">
    >,
  ) {
    const updateData: any = {
      updated_at: new Date(),
    };

    if (definition.content !== undefined) {
      updateData.content = definition.content;
    }

    if (definition.isPublic !== undefined) {
      updateData.is_public = definition.isPublic;
    }

    if (definition.tags !== undefined) {
      updateData.tags =
        definition.tags.length > 0 ? definition.tags : this.knex.raw("'{}'::text[]");
    }

    if (definition.mediaUrls !== undefined) {
      updateData.media_urls = JSON.stringify(definition.mediaUrls);
    }

    return this.knex("definitions")
      .where({ id })
      .whereNull("deleted_at")
      .update(updateData)
      .returning([
        "id",
        "word_id as wordId",
        "term_id as termId",
        "user_id as userId",
        "content",
        "tags",
        "media_urls as mediaUrls",
        "created_at as createdAt",
        "updated_at as updatedAt",
      ]);
  }
}
