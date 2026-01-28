import "reflect-metadata";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  cursor?: string;

  get offset(): number {
    return ((this.page ?? 0) - 1) * (this.limit ?? 0);
  }
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: {
    page: number;
    total: number;
    limit: number;
    nextCursor?: string;
  };

  constructor(
    data: T[],
    total: number,
    page: number,
    limit: number,
    nextCursor?: string,
  ) {
    this.data = data;
    this.meta = {
      page,
      total,
      limit,
      nextCursor,
    };
  }
}
