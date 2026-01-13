import { Controller, Get, Query } from "@nestjs/common";
import { PaginationDto } from "@shared";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	async getUsers(@Query() paginationDto: PaginationDto) {
		return this.usersService.getUsers(paginationDto);
	}
}
