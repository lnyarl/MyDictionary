import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateDefinitionSubDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class CreateWordDto {
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  @IsString()
  public readonly term: string;

  @IsNotEmpty()
  public readonly definition: CreateDefinitionSubDto;
}
