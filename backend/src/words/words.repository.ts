import { Injectable } from "@nestjs/common";
import { TABLES, TableName } from "@shared";
import { BaseRepository } from "../common/database/base.repository";
import { Word } from "./entities/word.entity";

@Injectable()
export class WordsRepository extends BaseRepository {
  private tableName: TableName = TABLES.WORDS;

  findByUserId(userId: string): Promise<Word[]> {
    return this.query(this.tableName)
      .select<Word[]>()
      .where({ userId })
      .orderBy("created_at", "desc");
  }

  findPublicByUserId(userId: string, limit: number, offset: number) {
    const baseQuery = this.query(this.tableName).where({ userId, isPublic: true });
    const listQuery = baseQuery
      .clone()
      .select<Word[]>()
      .limit(limit)
      .offset(offset)
      .orderBy("created_at", "desc");
    const countQuery = baseQuery.clone().count<{ count: number }>("* as count").first();

    return { listQuery, countQuery };
  }

  countPublicByUserId(userId: string): Promise<number> {
    return this.query(this.tableName).where({ userId, isPublic: true }).count("* as count").first();
  }

  create(word: Partial<Word>): Promise<Word> {
    return this.knex(this.tableName).insert(word);
  }

  delete(id: string): Promise<void> {
    return this.softDelete(this.tableName, id);
  }

  updateAll(id: string, data: Partial<Word>): Promise<Word> {
    return this.update(this.tableName, id, data);
  }

  findById(id: string): Promise<Word> {
    return this.query(this.tableName).select<Word>().where({ id });
  }

  /**
   * Search words with definitions
   * Includes complex joins and aggregation
   */
  searchWithDefinitions(term: string, userId: string | undefined, limit: number, offset: number) {
    const normalizedTerm = `%${term}%`;

    // Base query for count
    const baseQuery = this.knex(TABLES.WORDS)
      .whereNull(`${TABLES.WORDS}.deleted_at`)
      .where(`${TABLES.WORDS}.term`, "ilike", normalizedTerm);

    // Apply visibility filter
    if (userId) {
      baseQuery.where((builder) => {
        builder.where(`${TABLES.WORDS}.user_id`, userId).orWhere(`${TABLES.WORDS}.is_public`, true);
      });
    } else {
      baseQuery.where(`${TABLES.WORDS}.is_public`, true);
    }

    const countQuery = baseQuery.clone().count<{ count: number }>("* as count").first();

    const listQuery = baseQuery
      .clone()
      .select(
        `${TABLES.WORDS}.*`,
        this.knex.raw(`
					COALESCE(
						json_agg(
							json_build_object(
								'id', d.id,
								'content', d.content,
								'word_id', d.word_id,
								'user_id', d.user_id,
								'likes_count', d.likes_count,
								'created_at', d.created_at,
								'updated_at', d.updated_at,
								'user', json_build_object(
									'id', du.id,
									'nickname', du.nickname,
									'email', du.email,
									'google_id', du.google_id,
									'profile_picture', du.profile_picture,
									'created_at', du.created_at,
									'updated_at', du.updated_at,
									'deleted_at', du.deleted_at
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
						'google_id', wu.google_id,
						'profile_picture', wu.profile_picture,
						'created_at', wu.created_at,
						'updated_at', wu.updated_at,
						'deleted_at', wu.deleted_at
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
      .orderBy(`${TABLES.WORDS}.created_at`, "desc")
      .limit(limit)
      .offset(offset);

    return { listQuery, countQuery };
  }
}
