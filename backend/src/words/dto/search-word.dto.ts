import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class SearchWordDto extends PaginationDto {
	@IsString()
	@IsNotEmpty()
	@MinLength(1)
	@MaxLength(100)
	term: string;
}
