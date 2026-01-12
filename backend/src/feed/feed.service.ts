import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PaginatedResponseDto, PaginationDto } from "../common/dto/pagination.dto";
import { Definition } from "../definitions/entities/definition.entity";
import { FollowsService } from "../follows/follows.service";

@Injectable()
export class FeedService {
	constructor(
		@InjectRepository(Definition)
		private readonly definitionRepository: Repository<Definition>,
		private readonly followsService: FollowsService,
	) { }

	async getFeed(
		userId: string,
		paginationDto: PaginationDto,
	): Promise<PaginatedResponseDto<Definition>> {
		// Get users that current user follows + self
		const followingIds = await this.followsService.getFollowingIds(userId);
		const userIds = [...followingIds, userId];

		// Query definitions from followed users + self
		const queryBuilder = this.definitionRepository
			.createQueryBuilder("definition")
			.leftJoinAndSelect("definition.user", "user")
			.leftJoinAndSelect("definition.word", "word")
			.where("definition.user_id IN (:...userIds)", { userIds })
			.andWhere("word.is_public = :isPublic", { isPublic: true })
			.orderBy("definition.created_at", "DESC")
			.skip(paginationDto.offset)
			.take(paginationDto.limit);

		const [definitions, total] = await queryBuilder.getManyAndCount();

		return new PaginatedResponseDto<Definition>(
			definitions,
			total,
			paginationDto.page,
			paginationDto.limit,
		);
	}
}
