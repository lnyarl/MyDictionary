import { Injectable } from "@nestjs/common";
import { generateId, TABLES } from "@stashy/shared";
import { BaseRepository } from "../common/database/base.repository";
import { Definition, DefinitionSelect, OnlyDefinitionSelect } from "./entities/definition.entity";

@Injectable()
export class DefinitionsRepository extends BaseRepository {
  private tableName = TABLES.DEFINITIONS;

  findByUserId(userId: string, limit: number, cursor?: string) {
    const baseQuery = this.query(this.tableName).where({ user_id: userId });

    if (cursor) {
      baseQuery.where("created_at", "<", cursor);
    }

    const listQuery = baseQuery
      .clone()
      .orderBy("created_at", "DESC")
      .select<Definition[]>(OnlyDefinitionSelect)
      .limit(limit);

    return listQuery;
  }

  async ensureTerm(term: string): Promise<string> {
    const existing = await this.query(TABLES.TERMS).where({ text: term }).first();
    if (existing) {
      return existing.id;
    }

    const [newTerm] = await this.knex(TABLES.TERMS)
      .insert({
        id: generateId(),
        text: term,
        created_at: new Date(),
      })
      .returning("id");

    return newTerm.id;
  }

  findById(definitionId: string) {
    return this.query(this.tableName)
      .select<Definition>(OnlyDefinitionSelect)
      .where({ id: definitionId })
      .first();
  }

  findByWordIdAndUserId(wordId: string, userId: string) {
    return this.query(this.tableName)
      .select<Definition[]>(OnlyDefinitionSelect)
      .where({ word_id: wordId, user_id: userId })
      .orderBy("created_at", "desc");
  }

  findByIdWithPublic(definitionId: string) {
    return this.query(this.tableName)
      .leftJoin(TABLES.WORDS, `${TABLES.WORDS}.id`, `${this.tableName}.word_id`)
      .leftJoin(TABLES.USERS, `${TABLES.USERS}.id`, `${this.tableName}.user_id`)
      .select<
        Definition & {
          wordUserId: string;
          nickname: string;
          profilePicture: string;
          term: string;
        }
      >({
        id: `${this.tableName}.id`,
        wordId: `${this.tableName}.word_id`,
        term: "words.term",
        termId: `${this.tableName}.term_id`,
        userId: `${this.tableName}.user_id`,
        content: `${this.tableName}.content`,
        tags: `${this.tableName}.tags`,
        isPublic: `${this.tableName}.is_public`,
        mediaUrls: `${this.tableName}.media_urls`,
        createdAt: `${this.tableName}.created_at`,
        updatedAt: `${this.tableName}.updated_at`,
        wordUserId: `${TABLES.WORDS}.user_id`,
        nickname: "users.nickname",
        profilePicture: `users.profile_picture`,
      })
      .where({ [`${this.tableName}.id`]: definitionId })
      .groupBy(`${this.tableName}.id`, `${TABLES.WORDS}.id`, "users.id")
      .first();
  }

  findByTerm(term: string, userId?: string) {
    const baseQuery = this.query(this.tableName)
      .innerJoin(TABLES.WORDS, `${TABLES.WORDS}.id`, `${this.tableName}.word_id`)
      .innerJoin(TABLES.USERS, `${TABLES.USERS}.id`, `${this.tableName}.user_id`)
      .where(`${TABLES.WORDS}.term`, `${term}`);

    if (userId) {
      baseQuery.where((builder) => {
        builder
          .where({ [`${this.tableName}.is_public`]: true })
          .orWhere({ [`${this.tableName}.user_id`]: userId });
      });
    } else {
      baseQuery.where({ [`${this.tableName}.is_public`]: true });
    }

    return baseQuery
      .select<Definition[]>(DefinitionSelect)
      .orderBy(`${this.tableName}.created_at`, "DESC");
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
    return this.query(this.tableName)
      .where({ user_id: userId })
      .count<{ count: number }>("* as count")
      .first();
  }

  delete(id: string): Promise<void> {
    return this.softDelete(this.tableName, id);
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

    return this.knex(this.tableName)
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

    return this.knex(this.tableName)
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
