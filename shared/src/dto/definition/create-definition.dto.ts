import { Transform } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";

export class CreateDefinitionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;

  @IsUUID()
  @IsNotEmpty()
  wordId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    if (!value) return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
