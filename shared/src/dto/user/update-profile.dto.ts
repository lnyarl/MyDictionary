import { IsOptional, IsString, Length, Matches } from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 20)
  @Matches(/^[a-zA-Z0-9가-힣_]+$/, {
    message: "Nickname can only contain letters, numbers, Korean characters, and underscores",
  })
  nickname?: string;

  @IsOptional()
  @IsString()
  @Length(0, 150)
  bio?: string;
}
