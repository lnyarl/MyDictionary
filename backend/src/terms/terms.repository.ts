import { Injectable, Scope } from "@nestjs/common";
import { TABLES, TableName, Term, TermSelect } from "@stashy/shared";
import { BaseRepository } from "../common/database/base.repository";

@Injectable({ scope: Scope.TRANSIENT })
export class TermsRepository extends BaseRepository {
  private tableName: TableName = TABLES.TERMS;

  async search(term: string, limit: number, cursor?: string) {
    const baseQuery = this.query(this.tableName)
      .leftJoin(`${TABLES.DEFINITIONS} as d`, `d.term_id`, `${this.tableName}.id`)
      .leftJoin(`${TABLES.USERS} as u`, `u.id`, `d.user_id`)
      .where(`${this.tableName}.text`, "ilike", `%${term}%`)
      .groupBy(`${this.tableName}.id`);

    if (cursor) {
      baseQuery.where(`${this.tableName}.created_at`, "<", cursor);
    }

    return baseQuery
      .select([
        `${this.tableName}.id`,
        `${this.tableName}.text`,
        `${this.tableName}.number`,
        `${this.tableName}.created_at as createdAt`,
        this.knex.raw(`
          COALESCE(
            json_agg(
              json_build_object(
                'id', d.id,
                'content', d.content,
                'termId', d.term_id,
                'userId', d.user_id,
                'likesCount', 0,
                'createdAt', d.created_at,
                'updatedAt', d.updated_at,
                'nickname', u.nickname,
                'profilePicture', u.profile_picture
              ) ORDER BY d.created_at DESC
            ) FILTER (WHERE d.id IS NOT NULL),
            '[]'
          ) as definitions
        `),
      ])
      .orderBy(`${this.tableName}.created_at`, "desc")
      .limit(limit);
  }

  async findById(id: string) {
    return this.query(this.tableName).select<Term>(TermSelect).where({ id }).first();
  }
}
