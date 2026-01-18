import { Injectable } from "@nestjs/common";
import { generateId, TABLES } from "@shared";
import { BaseRepository } from "../common/database/base.repository";
import { Definition, DefinitionSelect } from "./entities/definition.entity";

@Injectable()
export class DefinitionsRepository extends BaseRepository {
  private tableName = TABLES.DEFINITIONS;

  findByUserId(userId: string, offset: number, limit: number) {
    const baseQuery = this.query(this.tableName)
      .select<Definition[]>(DefinitionSelect)
      .where({ user_id: userId });

    const listQuery = baseQuery.clone().orderBy("created_at", "DESC").offset(offset).limit(limit);
    const countQuery = baseQuery.clone().count<{ count: number }>("* as count").first();

    return { listQuery, countQuery };
  }

  findById(definitionId: string): Promise<Definition> {
    return this.query(this.tableName)
      .select<Definition>(DefinitionSelect)
      .where({ id: definitionId })
      .first();
  }

  findByWordIdAndUserId(wordId: string, userId: string): Promise<Definition[]> {
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
          isPublic: boolean;
          wordUserId: string;
          likesCount: number;
        }
      >(
        `${this.tableName}.id`,
        `${this.tableName}.word_id as wordId`,
        `${this.tableName}.user_id as userId`,
        `${this.tableName}.content`,
        `count(${TABLES.LIKES}.id) as likesCount`,
        `${this.tableName}.created_at as createdAt`,
        `${this.tableName}.updated_at as updatedAt`,
        `${TABLES.WORDS}.is_public as isPublic`,
        `${TABLES.WORDS}.user_id as wordUserId`,
      )
      .where({ [`${this.tableName}.id`]: definitionId })
      .groupBy(`${this.tableName}.id`, `${TABLES.WORDS}.id`)
      .first();
  }

  findByWordIdForEachUser(wordId: string) {
    return this.knex.raw(
      `
			SELECT 
        d.id, 
        d.word_id as wordId, 
        d.user_id as userId, 
        d.content, 
        COALESCE(l.likes_count, 0) as likesCount, 
        d.created_at as createdAt, 
        d.updated_at as updatedAt,
        u.nickname as nickname
			FROM (
				SELECT *,
					ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
				FROM definitions
				WHERE word_id = ? AND deleted_at IS NULL
			) d
			LEFT JOIN (
				SELECT definition_id, COUNT(*) as likes_count
				FROM likes
				WHERE deleted_at IS NULL
				GROUP BY definition_id
			) l ON d.id = l.definition_id
			LEFT JOIN users u ON d.user_id = u.id
			WHERE d.rn = 1
			ORDER BY d.created_at DESC
			`,
      [wordId],
    );
  }

  getCountByUserId(userId: string) {
    return this.query(this.tableName)
      .where({ user_id: userId, is_public: true })
      .count<{ count: number }>("* as count")
      .first();
  }

  delete(id: string): Promise<void> {
    return this.softDelete(this.tableName, id);
  }

  create(definition: Partial<Definition>): Promise<Definition> {
    const now = new Date();
    return this.knex(this.tableName).insert({
      id: definition.id || generateId(),
      word_id: definition.wordId,
      user_id: definition.userId,
      content: definition.content,
      created_at: now,
      updated_at: now,
    });
  }
}
