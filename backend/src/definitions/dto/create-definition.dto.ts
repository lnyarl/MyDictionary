import {
	IsNotEmpty,
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
}
