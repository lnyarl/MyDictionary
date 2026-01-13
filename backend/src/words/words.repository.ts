import { Injectable } from "@nestjs/common";
import { TABLES, TableName } from "@shared";
import { BaseRepository, } from "../common/database/base.repository";
import { Word } from "./entities/word.entity";

@Injectable()
export class WordsRepository extends BaseRepository {
	private tableName: TableName = TABLES.WORDS;

	/**
	 * Find all words by user ID
	 */
	async findByUserId(userId: string): Promise<Word[]> {
		return this.query(this.tableName).select<Word[]>().where({ userId }).orderBy("created_at", "desc");
	}

	/**
	 * Find public words by user ID with pagination
	 */
	async findPublicByUserId(userId: string, limit: number, offset: number): Promise<[Word[], number]> {
		const baseQuery = this.query(this.tableName).where({ userId, isPublic: true });

		// Count query
		const countResult = await baseQuery.clone().count("* as count").first();
		const total = Number(countResult?.count || 0);

		// Data query
		const dataQuery = baseQuery.clone();
		dataQuery.limit(limit).offset(offset);

		const data = await dataQuery.orderBy("created_at", "desc");

		return [data, total];
	}

	/**
	 * Count public words by user ID
	 */
	async countPublicByUserId(userId: string): Promise<number> {
		return this.query(this.tableName).where({ userId, isPublic: true })
			.count("* as count")
			.first();
	}

	async create(word: Partial<Word>): Promise<Word> {
		return await this.knex(this.tableName).insert(word);
	}

	async delete(id: string): Promise<void> {
		await this.softDelete(this.tableName, id);
	}

	async updateAll(id: string, data: Partial<Word>): Promise<Word> {
		return await this.update(this.tableName, id, data);
	}

	async findById(id: string): Promise<Word> {
		return await this.query(this.tableName).select<Word>().where({ id });
	}

	/**
	 * Search words with definitions
	 * Includes complex joins and aggregation
	 */
	async searchWithDefinitions(
		term: string,
		userId: string | undefined,
		limit: number,
		offset: number,
	): Promise<[Word[], number]> {
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

		// Count query
		const countResult = await baseQuery.clone().count("* as count").first();
		const total = Number(countResult?.count || 0);

		// Data query with definitions
		const words = await baseQuery
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

		return [words, total];
	}
}
