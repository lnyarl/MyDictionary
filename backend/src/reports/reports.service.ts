import { Injectable } from "@nestjs/common";
import { User } from "../users/entities/user.entity";
import { CreateReportDto } from "./dto/create-report.dto";
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
