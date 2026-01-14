import { Injectable } from "@nestjs/common";
import { TABLES } from "@shared";
import { BaseRepository } from "../common/database/base.repository";
import { Like } from "../likes/entities/like.entity";
import { Definition } from "./entities/definition.entity";

@Injectable()
export class DefinitionsRepository extends BaseRepository {
  private tableName = TABLES.DEFINITIONS;

  findByUserId(userId: string, offset: number, limit: number) {
    const baseQuery = this.query(this.tableName)
      .select<Definition[]>()
      .where({ user_id: userId, is_public: true });

    const listQuery = baseQuery
      .clone()
      .orderBy("definition.created_at", "DESC")
      .offset(offset)
      .limit(limit);
    const countQuery = baseQuery.clone().count<{ count: number }>("* as count").first();

    return { listQuery, countQuery };
  }

  findById(definitionId: string): Promise<Definition> {
    return this.query(this.tableName).select<Definition>().where({ definitionId });
  }

  findByWordIdAndUserId(wordId: string, userId: string): Promise<Definition[]> {
    return this.query(this.tableName)
      .select<Definition[]>()
      .where({ word_id: wordId, user_id: userId })
      .orderBy("created_at", "desc");
  }

  findByIdWithPublic(definitionId: string) {
    return this.query(this.tableName)
      .leftJoin(TABLES.WORDS, "id", "word_id")
      .select<
        Definition & {
          is_public: boolean;
          word_user_id: string;
          user_id: string;
        }
      >("*", "words.user_id as word_user_id", "definitions.user_id as user_id")
      .where({ definitionId });
  }

  findByWordIdForEachUser(wordId: string) {
    return this.knex.raw(
      `
			SELECT d.*, u.id as "user_id", u.nickname as "user_nickname"
			FROM (
				SELECT *,
					ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
				FROM definitions
				WHERE word_id = $1 AND deleted_at IS NULL
			) d
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

  decrement(id: string) {
    return this.knex(this.tableName).where({ id }).decrement("likes_count", 1);
  }

  increment(id: string) {
    return this.knex(this.tableName).where({ id }).increment("likes_count", 1);
  }

  delete(id: string): Promise<void> {
    return this.softDelete(this.tableName, id);
  }

  create(definition: Partial<Like>): Promise<Definition> {
    const now = new Date();
    definition.createdAt = now;
    definition.updatedAt = now;
    return this.knex(this.tableName).insert(definition);
  }
}
