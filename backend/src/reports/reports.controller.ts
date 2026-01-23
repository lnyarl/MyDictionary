import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { User } from "../users/entities/user.entity";
import { CreateReportDto } from "./dto/create-report.dto";
import { ReportsService } from "./reports.service";

@Controller("reports")
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async create(@CurrentUser() user: User, @Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(user, createReportDto);
  }
}
