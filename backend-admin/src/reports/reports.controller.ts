import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { PaginationDto } from "@shared";
import { AdminRole } from "../admin-users/entities/admin-user.entity";
import { Roles } from "../auth/decorators/roles.decorator";
import { ReportStatus } from "./entities/report.entity";
import { ReportsService } from "./reports.service";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.OPERATOR)
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.reportsService.findAll(paginationDto);
  }

  @Patch(":id/status")
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.OPERATOR)
  async updateStatus(@Param("id") id: string, @Body("status") status: ReportStatus) {
    return this.reportsService.updateStatus(id, status);
  }
}
