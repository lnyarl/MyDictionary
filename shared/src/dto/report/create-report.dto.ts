import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { ReportReason } from "../../entities/report.entity";

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
