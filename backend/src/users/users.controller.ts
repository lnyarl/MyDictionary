import { Body, Controller, Get, Patch } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UpdateNicknameDto } from "./dto/update-nickname.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) { }

	@Get("me")
	getMe(@CurrentUser() user: User) {
		return user;
	}

	@Patch("me/nickname")
	async updateNickname(
		@CurrentUser() user: User,
		@Body() updateNicknameDto: UpdateNicknameDto,
	) {
		return this.usersService.updateNickname(
			user.id,
			updateNicknameDto.nickname,
		);
	}
}
