import { Injectable } from "@nestjs/common";
import { CreateReportDto } from "@stashy/shared/src/dto/dto/create-report.dto";
import { User } from "../users/entities/user.entity";
import { ReportsRepository } from "./reports.repository";

@Injectable()
export class ReportsService {
  constructor(private readonly reportsRepository: ReportsRepository) {}

  async create(user: User, createReportDto: CreateReportDto) {
    return this.reportsRepository.create({
      reporterId: user.id,
      ...createReportDto,
    });
  }
}
