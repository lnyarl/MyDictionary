
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateWordDto {
	@IsNotEmpty()
	@MinLength(1)
	@MaxLength(100)
	@IsString()
	public readonly term: string;

	@IsBoolean()
	@IsOptional()
	public readonly isPublic?: boolean;
}
