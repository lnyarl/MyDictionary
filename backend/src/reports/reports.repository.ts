import { Injectable } from "@nestjs/common";
import { TABLES } from "@shared/constants/tables";
import { BaseRepository } from "../common/database/base.repository";
import { CreateReportDto } from "./dto/create-report.dto";
import { Report, ReportSelect } from "./entities/report.entity";

@Injectable()
export class ReportsRepository extends BaseRepository {
  async create(data: CreateReportDto & { reporterId: string }): Promise<Report> {
    const [report] = await this.knex(TABLES.REPORTS)
      .insert({
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
