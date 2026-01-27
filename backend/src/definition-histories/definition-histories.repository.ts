import { Injectable } from "@nestjs/common";
import { generateId, TABLES } from "@stashy/shared";
import { BaseRepository } from "../common/database/base.repository";
import { DefinitionHistory, DefinitionHistorySelect } from "./entities/definition-history.entity";

@Injectable()
export class DefinitionHistoriesRepository extends BaseRepository {
  private tableName = TABLES.DEFINITION_HISTORIES;

  create(history: Omit<DefinitionHistory, "id" | "createdAt">) {
    const now = new Date();
    return this.knex(this.tableName)
      .insert({
        id: generateId(),
        definition_id: history.definitionId,
        content: history.content,
        tags: history.tags?.length > 0 ? history.tags : this.knex.raw("'{}'::text[]"),
        media_urls: JSON.stringify(history.mediaUrls || []),
        created_at: now,
      })
      .returning([
        "id",
        "definition_id as definitionId",
        "content",
        "tags",
        "media_urls as mediaUrls",
        "created_at as createdAt",
      ]);
  }

  findByDefinitionId(definitionId: string): Promise<DefinitionHistory[]> {
    return this.knex(this.tableName)
      .select<DefinitionHistory[]>(DefinitionHistorySelect)
      .where({ definition_id: definitionId })
      .orderBy("created_at", "desc");
  }
}
