import { Injectable } from "@nestjs/common";
import { generateId } from "@stashy/shared";
import { CreateReportDto } from "@stashy/shared/dto/report/create-report.dto";
import { BaseRepository } from "../common/database/base.repository";

@Injectable()
export class ReportsRepository extends BaseRepository {
  findById(id: string) {
    return this.knex("reports")
      .where({ id: id })
      .select({
        id: "id",
        reporterId: "reporter_id",
        reportedUserId: "reported_user_id",
        definitionId: "definition_id",
        reason: "reason",
        status: "status",
        description: "description",
        createdAt: "created_at",
        updatedAt: "updated_at",
        resolvedAt: "resolved_at",
      })
      .first();
  }

  create(data: CreateReportDto & { reporterId: string }) {
    return this.knex("reports")
      .insert({
        id: generateId(),
        reporter_id: data.reporterId,
        reported_user_id: data.reportedUserId,
        definition_id: data.definitionId,
        reason: data.reason.toString(),
        description: data.description,
        status: "PENDING",
      })
      .returning("id");
  }
}
