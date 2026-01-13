import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PaginationDto, PaginatedResponseDto, User } from "@shared";

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	async getUsers(
		paginationDto: PaginationDto,
	): Promise<PaginatedResponseDto<User>> {
		const [users, total] = await this.userRepository.findAndCount({
			select: [
				"id",
				"email",
				"nickname",
				"profilePicture",
				"createdAt",
				"updatedAt",
			],
			order: { createdAt: "DESC" },
			skip: paginationDto.offset,
			take: paginationDto.limit,
		});

		return new PaginatedResponseDto<User>(
			users,
			total,
			paginationDto.page,
			paginationDto.limit,
		);
	}
}
