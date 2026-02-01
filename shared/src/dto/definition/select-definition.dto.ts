import { IsNotEmpty, IsString } from "class-validator";
import { PaginationDto } from "../pagination.dto";

export class GetByUserIdDto extends PaginationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
