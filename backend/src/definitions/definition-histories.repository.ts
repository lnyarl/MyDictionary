import { Injectable } from "@nestjs/common";
import { generateId } from "@stashy/shared";
import { DefinitionHistories } from "@stashy/shared/types/db_entity.generated";
import { BaseRepository } from "../common/database/base.repository";
import { DefinitionHistorySelect } from "./entities/definition-history.entity";

@Injectable()
export class DefinitionHistoriesRepository extends BaseRepository {
  create(history: Omit<DefinitionHistories, "id" | "createdAt">) {
    const now = new Date();
    return this.knex("definition_histories")
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

  findByDefinitionId(definitionId: string): Promise<DefinitionHistories[]> {
    return this.knex("definition_histories")
      .select<DefinitionHistories[]>(DefinitionHistorySelect)
      .where({ definition_id: definitionId })
      .orderBy("created_at", "desc");
  }
}
