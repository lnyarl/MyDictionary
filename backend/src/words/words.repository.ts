import { Injectable, Scope } from "@nestjs/common";
import { generateId, TABLES, TableName } from "@stashy/shared";
import { BaseRepository } from "../common/database/base.repository";
import { Word, WordSelect } from "./entities/word.entity";

@Injectable({ scope: Scope.TRANSIENT })
export class WordsRepository extends BaseRepository {
  private tableName: TableName = TABLES.WORDS;

  findByUserId(userId: string) {
    return this.query(this.tableName)
      .select<Word[]>(WordSelect)
      .where({ user_id: userId })
      .orderBy("created_at", "desc");
  }

  findPublicByUserId(userId: string, limit: number, cursor?: string) {
    const baseQuery = this.query(this.tableName)
      .where({ user_id: userId })
      .whereExists(function () {
        this.select("*")
          .from(TABLES.DEFINITIONS)
          .whereRaw(`${TABLES.DEFINITIONS}.word_id = ${TABLES.WORDS}.id`)
          .andWhere(`${TABLES.DEFINITIONS}.is_public`, true)
          .whereNull(`${TABLES.DEFINITIONS}.deleted_at`);
      });

    if (cursor) {
      baseQuery.where(`${TABLES.WORDS}.created_at`, "<", cursor);
    }

    const listQuery = baseQuery
      .clone()
      .select<Word[]>(WordSelect)
      .limit(limit)
      .orderBy("created_at", "desc");

    return listQuery;
  }

  countPublicByUserId(userId: string) {
    return this.query(this.tableName)
      .where({ user_id: userId })
      .whereExists(function () {
        this.select("*")
          .from(TABLES.DEFINITIONS)
          .whereRaw(`${TABLES.DEFINITIONS}.word_id = ${TABLES.WORDS}.id`)
          .andWhere(`${TABLES.DEFINITIONS}.is_public`, true)
          .whereNull(`${TABLES.DEFINITIONS}.deleted_at`);
      })
      .count<{ count: number }>("* as count")
      .first();
  }

  create(word: Omit<Word, "id" | "createdAt" | "updatedAt" | "deletedAt">) {
    const now = new Date();
    return this.knex(this.tableName)
      .insert({
        id: generateId(),
        term: word.term,
        user_id: word.userId,
        created_at: now,
        updated_at: now,
      })
      .returning("id");
  }

  delete(id: string) {
    return this.softDelete(this.tableName, id);
  }

  async updateAll(id: string, data: Partial<Word>) {
    return await this.update<Word>(this.tableName, id, data);
  }

  findByTerm(userId: string, term: string) {
    return this.query(this.tableName)
      .select<Word>(WordSelect)
      .where({ user_id: userId, term })
      .first();
  }

  findById(id: string) {
    return this.query(this.tableName).select<Word>(WordSelect).where({ id }).first();
  }

  hasPublicDefinitions(wordId: string) {
    return this.query(TABLES.DEFINITIONS)
      .where({ word_id: wordId, is_public: true })
      .first<boolean>();
  }

  findMyWordsForAutocomplete(term: string, userId: string, limit: number) {
    return this.query(this.tableName)
      .select<Word[]>(WordSelect)
      .where({ user_id: userId })
      .where("term", "ilike", `%${term}%`)
      .orderBy("created_at", "desc")
      .limit(limit);
  }

  findOthersWordsForAutocomplete(term: string, limit: number) {
    const query = this.query("terms")
      .select<{ id: string; text: string }[]>({
        id: "id",
        text: "text",
      })
      .where("text", "ilike", `%${term}%`)
      .orderBy("created_at", "desc")
      .limit(limit);

    return query;
  }

  searchWithDefinitions(term: string, userId: string | undefined, limit: number, cursor?: string) {
    const normalizedTerm = `%${term}%`;

    const baseQuery = this.knex(TABLES.WORDS)
      .whereNull(`${TABLES.WORDS}.deleted_at`)
      .where(`${TABLES.WORDS}.term`, "ilike", normalizedTerm);

    if (cursor) {
      baseQuery.where(`${TABLES.WORDS}.created_at`, "<", cursor);
    }

    if (userId) {
      baseQuery.where((builder) => {
        builder.where(`${TABLES.WORDS}.user_id`, userId).orWhereExists(function () {
          this.select("*")
            .from(TABLES.DEFINITIONS)
            .whereRaw(`${TABLES.DEFINITIONS}.word_id = ${TABLES.WORDS}.id`)
            .andWhere(`${TABLES.DEFINITIONS}.is_public`, true)
            .whereNull(`${TABLES.DEFINITIONS}.deleted_at`);
        });
      });
    } else {
      baseQuery.whereExists(function () {
        this.select("*")
          .from(TABLES.DEFINITIONS)
          .whereRaw(`${TABLES.DEFINITIONS}.word_id = ${TABLES.WORDS}.id`)
          .andWhere(`${TABLES.DEFINITIONS}.is_public`, true)
          .whereNull(`${TABLES.DEFINITIONS}.deleted_at`);
      });
    }

    const listQuery = baseQuery
      .clone()
      .select(
        `${TABLES.WORDS}.id`,
        `${TABLES.WORDS}.term`,
        `${TABLES.WORDS}.user_id as userId`,
        `${TABLES.WORDS}.created_at as createdAt`,
        `${TABLES.WORDS}.updated_at as updatedAt`,
        `${TABLES.WORDS}.deleted_at as deletedAt`,
        this.knex.raw(`
          COALESCE(
            json_agg(
              json_build_object(
                'id', d.id,
                'content', d.content,
                'wordId', d.word_id,
                'userId', d.user_id,
                'likesCount', 0,
                'createdAt', d.created_at,
                'updatedAt', d.updated_at,
                'user', json_build_object(
                  'id', du.id,
                  'nickname', du.nickname,
                  'email', du.email,
                  'googleId', du.google_id,
                  'profilePicture', du.profile_picture,
                  'createdAt', du.created_at,
                  'updatedAt', du.updated_at,
                  'deletedAt', du.deleted_at
                )
              ) ORDER BY d.created_at DESC
            ) FILTER (WHERE d.id IS NOT NULL),
            '[]'
          ) as definitions
        `),
        this.knex.raw(`
          json_build_object(
            'id', wu.id,
            'nickname', wu.nickname,
            'email', wu.email,
            'googleId', wu.google_id,
            'profilePicture', wu.profile_picture,
            'createdAt', wu.created_at,
            'updatedAt', wu.updated_at,
            'deletedAt', wu.deleted_at
          ) as user
        `),
      )
      .leftJoin(`${TABLES.DEFINITIONS} as d`, function () {
        this.on(`d.word_id`, "=", `${TABLES.WORDS}.id`).andOnNull("d.deleted_at");
      })
      .leftJoin(`${TABLES.USERS} as du`, function () {
        this.on(`du.id`, "=", "d.user_id").andOnNull("du.deleted_at");
      })
      .leftJoin(`${TABLES.USERS} as wu`, function () {
        this.on(`wu.id`, "=", `${TABLES.WORDS}.user_id`).andOnNull("wu.deleted_at");
      })
      .groupBy(`${TABLES.WORDS}.id`, "wu.id")
      .orderByRaw(`CASE WHEN ${TABLES.WORDS}.user_id = ? THEN 0 ELSE 1 END`, [
        userId || "00000000-0000-0000-0000-000000000000",
      ])
      .orderBy(`${TABLES.WORDS}.created_at`, "desc")
      .limit(limit);

    return listQuery;
  }
}
