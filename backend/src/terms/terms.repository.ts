import { Injectable, Scope } from "@nestjs/common";
import { TABLES, TableName, Term, TermSelect } from "@stashy/shared";
import { BaseRepository } from "../common/database/base.repository";

@Injectable({ scope: Scope.TRANSIENT })
export class TermsRepository extends BaseRepository {
  private tableName: TableName = TABLES.TERMS;

  async search(term: string, limit: number, cursor?: string) {
    // Build the search query with weighted scoring
    // Term match: 5 points, Content match: 4 points, Tags match: 1 point
    const searchPattern = `%${term}%`;

    // Use a subquery to handle the GROUP BY issue with CASE WHEN on joined columns
    const subquery = this.query(this.tableName)
      .leftJoin(`${TABLES.DEFINITIONS} as d`, `d.term_id`, `${this.tableName}.id`)
      .leftJoin(`${TABLES.USERS} as u`, `u.id`, `d.user_id`)
      .where((builder) => {
        builder
          .where(`${this.tableName}.text`, "ilike", searchPattern)
          .orWhere("d.content", "ilike", searchPattern)
          .orWhereRaw(`? = ANY(d.tags)`, [term]);
      })
      .select([
        `${this.tableName}.id`,
        `${this.tableName}.text`,
        `${this.tableName}.number`,
        `${this.tableName}.created_at as createdAt`,
        // Calculate search score in subquery to avoid GROUP BY issues
        this.knex.raw(
          `
          (
            CASE WHEN ${this.tableName}.text ILIKE ? THEN 5 ELSE 0 END +
            CASE WHEN d.content ILIKE ? THEN 4 ELSE 0 END +
            CASE WHEN ? = ANY(d.tags) THEN 1 ELSE 0 END
          ) as search_score
        `,
          [searchPattern, searchPattern, term],
        ),
        // Build definition objects in subquery
        this.knex.raw(`
          json_build_object(
            'id', d.id,
            'content', d.content,
            'termId', d.term_id,
            'userId', d.user_id,
            'likesCount', 0,
            'createdAt', d.created_at,
            'updatedAt', d.updated_at,
            'nickname', u.nickname,
            'tags', d.tags,
            'profilePicture', u.profile_picture
          ) as definition_obj
        `),
      ]);

    if (cursor) {
      subquery.where(`${this.tableName}.created_at`, "<", cursor);
    }

    // Main query that aggregates the results
    return this.knex
      .with("search_data", subquery)
      .from("search_data")
      .select([
        "id",
        "text",
        "number",
        "createdAt",
        "search_score",
        this.knex.raw(`
          COALESCE(
            json_agg(definition_obj) FILTER (WHERE definition_obj->>'id' IS NOT NULL),
            '[]'
          ) as definitions
        `),
      ])
      .groupBy(["id", "text", "number", "createdAt", "search_score"])
      .orderBy([
        { column: "search_score", order: "desc" },
        { column: "createdAt", order: "desc" },
      ])
      .limit(limit);
  }

  async findById(id: string) {
    return this.query(this.tableName).select<Term>(TermSelect).where({ id }).first();
  }
}
