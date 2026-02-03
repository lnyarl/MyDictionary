import { Injectable, NotFoundException } from "@nestjs/common";
import {
  PaginatedResponseDto,
  PaginationDto,
} from "@stashy/shared/admin/dto/pagination.dto";
import { Report, ReportStatus } from "./entities/report.entity";
import { ReportsRepository } from "./reports.repository";

@Injectable()
export class ReportsService {
  constructor(private readonly reportsRepository: ReportsRepository) {}

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Report>> {
    const { listQuery, countQuery } = await this.reportsRepository.findAll(
      paginationDto.offset,
      paginationDto.limit,
    );
    const reports = await listQuery;
    const totalResult = await countQuery;
    const total = totalResult ? Number(totalResult.count) : 0;

    return new PaginatedResponseDto<Report>(
      reports,
      total,
      paginationDto.page,
      paginationDto.limit,
    );
  }

  async findOne(id: string) {
    const report = await this.reportsRepository.findByIdWithDetails(id);
    if (!report) throw new NotFoundException("Report not found");
    return report;
  }

  async updateStatus(id: string, status: ReportStatus) {
    const report = await this.reportsRepository.findById(id);
    if (!report) throw new NotFoundException("Report not found");
    return this.reportsRepository.updateStatus(id, status);
  }
}
