import { Injectable } from "@nestjs/common";
import { TABLES } from "@stashy/shared/constants/tables";
import { Report } from "@stashy/shared/entities/report.entity";
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

    const countQuery = this.knex(TABLES.REPORTS)
      .count<{ count: number }>("* as count")
      .first();

    return { listQuery, countQuery };
  }

  async findById(id: string): Promise<Report | null> {
    return this.knex(TABLES.REPORTS).where({ id }).select(ReportSelect).first();
  }

  async findByIdWithDetails(id: string): Promise<Report | null> {
    return this.knex(TABLES.REPORTS)
      .leftJoin("users as reporter", "reports.reporter_id", "reporter.id")
      .leftJoin("users as reported", "reports.reported_user_id", "reported.id")
      .leftJoin("definitions", "reports.definition_id", "definitions.id")
      .leftJoin("words", "definitions.word_id", "words.id")
      .select({
        id: "reports.id",
        reporterId: "reports.reporter_id",
        definitionId: "reports.definition_id",
        reason: "reports.reason",
        status: "reports.status",
        description: "reports.description",
        createdAt: "reports.created_at",
        updatedAt: "reports.updated_at",
        resolvedAt: "reports.resolved_at",
        reporterNickname: "reporter.nickname",
        reportedUserId: "reports.reported_user_id",
        reportedNickname: "reported.nickname",
        reportedEmail: "reported.email",
        wordTerm: "words.term",
        definitionContent: "definitions.content",
        definitionsMediaUrls: "definitions.media_urls",
      })
      .where("reports.id", id)
      .first();
  }

  async updateStatus(id: string, status: ReportStatus): Promise<Report> {
    const [idOnly] = await this.knex(TABLES.REPORTS)
      .where({ id })
      .update({
        status,
        resolved_at: [ReportStatus.RESOLVED, ReportStatus.DISMISSED].includes(
          status,
        )
          ? new Date()
          : null,
        updated_at: new Date(),
      })
      .returning("id");

    return this.findById(idOnly.id) as Promise<Report>;
  }
}
