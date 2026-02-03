import { Injectable } from "@nestjs/common";
import { generateId, ReportSelect } from "@stashy/shared";
import { TABLES } from "@stashy/shared/constants/tables";
import { CreateReportDto } from "@stashy/shared/dto/report/create-report.dto";
import { BaseRepository } from "../common/database/base.repository";

@Injectable()
export class ReportsRepository extends BaseRepository {
  async create(data: CreateReportDto & { reporterId: string }) {
    const [report] = await this.knex(TABLES.REPORTS)
      .insert({
        id: generateId(),
        reporter_id: data.reporterId,
        reported_user_id: data.reportedUserId,
        definition_id: data.definitionId,
        reason: data.reason,
        description: data.description,
        status: "PENDING",
      })
      .returning("*");

    return this.knex(TABLES.REPORTS).where({ id: report.id }).select(ReportSelect).first();
  }
}
