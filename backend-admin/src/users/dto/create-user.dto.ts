import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nickname: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;
}
