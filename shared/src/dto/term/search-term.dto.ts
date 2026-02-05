import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { PaginationDto } from "../pagination.dto";

export class SearchTermDto extends PaginationDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  term: string;
}
