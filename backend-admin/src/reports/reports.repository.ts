import { Injectable } from "@nestjs/common";
import { TABLES } from "@shared/constants/tables";
import { Report } from "@shared/entities/report.entity";
import { BaseRepository } from "../common/database/base.repository";
import { ReportSelect, ReportStatus } from "./entities/report.entity";

@Injectable()
export class ReportsRepository extends BaseRepository {
  async findAll(offset: number, limit: number) {
    const listQuery = this.knex(TABLES.REPORTS)
      .select(ReportSelect)
      .offset(offset)
      .limit(limit)
      .orderBy("created_at", "desc");

    const countQuery = this.knex(TABLES.REPORTS).count<{ count: number }>("* as count").first();

    return { listQuery, countQuery };
  }

  async findById(id: string): Promise<Report | null> {
    return this.knex(TABLES.REPORTS).where({ id }).select(ReportSelect).first();
  }

  async updateStatus(id: string, status: ReportStatus): Promise<Report> {
    const [idOnly] = await this.knex(TABLES.REPORTS)
      .where({ id })
      .update({
        status,
        resolved_at: status !== ReportStatus.PENDING ? new Date() : null,
        updated_at: new Date(),
      })
      .returning("id");

    return this.findById(idOnly.id) as Promise<Report>;
  }
}
