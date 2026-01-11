import { IsNotEmpty, IsString, Length, Matches } from "class-validator";

export class UpdateNicknameDto {
	@IsString()
	@IsNotEmpty()
	@Length(2, 20)
	@Matches(/^[a-zA-Z0-9가-힣_]+$/, {
		message:
			"Nickname can only contain letters, numbers, Korean characters, and underscores",
	})
	nickname: string;
}
