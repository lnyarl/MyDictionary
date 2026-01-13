import { Injectable } from "@nestjs/common";
import { PaginatedResponseDto, PaginationDto } from "@shared";
import { FollowsService } from "../follows/follows.service";
import { Feed } from "./entities/feed.entity";
import { FeedRepository } from "./feed.repository";

@Injectable()
export class FeedService {
	constructor(
		private readonly feedRepository: FeedRepository,
		private readonly followsService: FollowsService,
	) { }

	async getFeed(userId: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<Feed>> {
		// Get users that current user follows + self
		const followingIds = await this.followsService.getFollowingIds(userId);
		const userIds = [...followingIds, userId];

		// Query definitions from followed users + self
		const feeds = await this.feedRepository.findFeeds(userIds, paginationDto.offset, paginationDto.limit);

		return new PaginatedResponseDto<Feed>(feeds, 0, paginationDto.page, paginationDto.limit);
	}
}
