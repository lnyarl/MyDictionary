import { Injectable } from "@nestjs/common";
import { generateId, TABLES } from "@shared";
import { BaseRepository } from "../common/database/base.repository";
import { Definition, DefinitionSelect } from "./entities/definition.entity";

@Injectable()
export class DefinitionsRepository extends BaseRepository {
  private tableName = TABLES.DEFINITIONS;

  findByUserId(userId: string, offset: number, limit: number) {
    const baseQuery = this.query(this.tableName).where({ user_id: userId });

    const listQuery = baseQuery
      .clone()
      .orderBy("created_at", "DESC")
      .select<Definition[]>(DefinitionSelect)
      .offset(offset)
      .limit(limit);
    const countQuery = baseQuery.clone().count<{ count: number }>("* as count").first();

    return { listQuery, countQuery };
  }

  findById(definitionId: string) {
    return this.query(this.tableName)
      .select<Definition>(DefinitionSelect)
      .where({ id: definitionId })
      .first();
  }

  findByWordIdAndUserId(wordId: string, userId: string) {
    return this.query(this.tableName)
      .select<Definition[]>(DefinitionSelect)
      .where({ word_id: wordId, user_id: userId })
      .orderBy("created_at", "desc");
  }

  findByIdWithPublic(definitionId: string) {
    return this.query(this.tableName)
      .leftJoin(TABLES.WORDS, `${TABLES.WORDS}.id`, `${this.tableName}.word_id`)
      .leftJoin(TABLES.LIKES, `${TABLES.LIKES}.definition_id`, `${this.tableName}.id`)
      .select<
        Definition & {
          wordUserId: string;
          likesCount: number;
        }
      >(
        `${this.tableName}.id`,
        `${this.tableName}.word_id as wordId`,
        `${this.tableName}.user_id as userId`,
        `${this.tableName}.content`,
        `${this.tableName}.tags`,
        `${this.tableName}.media_urls as mediaUrls`,
        this.knex.raw(`COUNT(${TABLES.LIKES}.id) as "likesCount"`),
        `${this.tableName}.created_at as createdAt`,
        `${this.tableName}.updated_at as updatedAt`,
        `${TABLES.WORDS}.user_id as wordUserId`,
      )
      .where({ [`${this.tableName}.id`]: definitionId })
      .groupBy(`${this.tableName}.id`, `${TABLES.WORDS}.id`)
      .first();
  }

  findAllByWordId(wordId: string) {
    return this.knex.raw(
      `
      SELECT 
        d.id, 
        d.word_id as wordId, 
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
    definition: Partial<Pick<Definition, "content" | "tags" | "mediaUrls" | "isPublic">>,
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
        "user_id as userId",
        "content",
        "tags",
        "media_urls as mediaUrls",
        "created_at as createdAt",
        "updated_at as updatedAt",
      ]);
  }
}
