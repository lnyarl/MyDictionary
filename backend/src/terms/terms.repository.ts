import { Injectable, Scope } from "@nestjs/common";
import { Terms } from "@stashy/shared/types/db_entity.generated";
import { BaseRepository } from "../common/database/base.repository";

@Injectable({ scope: Scope.TRANSIENT })
export class TermsRepository extends BaseRepository {
  search(term: string, limit: number, cursor?: string) {
    const searchPattern = `%${term}%`;
    const subquery = this.query("definitions")
      .leftJoin(`terms as t`, `definitions.term_id`, `t.id`)
      .leftJoin(`users as u`, `u.id`, `definitions.user_id`)
      .where((builder) => {
        builder
          .where(`t.text`, "ilike", searchPattern)
          .orWhere("definitions.content", "ilike", searchPattern)
          .orWhereRaw(`? = ANY(definitions.tags)`, [term]);
      })
      .select([
        `definitions.id`,
        `t.text as term`,
        `t.number`,
        this.knex.raw(
          `
          (
            CASE WHEN t.text ILIKE ? THEN 5 ELSE 0 END +
            CASE WHEN definitions.content ILIKE ? THEN 4 ELSE 0 END +
            CASE WHEN ? = ANY(definitions.tags) THEN 1 ELSE 0 END +
            extract(epoch from definitions.created_at)::bigint
          ) as search_score
        `,
          [searchPattern, searchPattern, term],
        ),
        "definitions.content as content",
        "definitions.created_at as  createdAt",
        "definitions.updated_at as updatedAt",
        "u.nickname as nickname",
        "u.profile_picture as profilePicture",
        "definitions.tags as tags",
      ]);

    // subquery사 사용할 필요는 없다
    const query = this.knex
      .with("search_data", subquery)
      .from("search_data")
      .select("*")

      .orderBy([{ column: "search_score", order: "desc" }])
      .limit(limit);
    if (cursor) {
      query.where(`search_score`, "<", cursor);
    }

    return query;
  }

  async findById(id: string) {
    return this.query("terms")
      .select<Terms>({
        id: "terms.id",
        text: "terms.text",
        number: "terms.number",
        createdAt: "terms.created_at",
      })
      .where({ id })
      .first();
  }
}
