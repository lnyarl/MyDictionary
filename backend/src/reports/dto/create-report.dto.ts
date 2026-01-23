import { ReportReason } from "@shared/entities/report.entity";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateReportDto {
  @IsUUID()
  @IsNotEmpty()
  reportedUserId: string;

  @IsUUID()
  @IsOptional()
  definitionId?: string;

  @IsEnum(ReportReason)
  @IsNotEmpty()
  reason: ReportReason;

  @IsString()
  @IsOptional()
  description?: string;
}
