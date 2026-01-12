import {
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Query,
} from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { PaginationDto } from "../common/dto/pagination.dto";
import { User } from "../users/entities/user.entity";
import { FollowsService } from "./follows.service";

@Controller("follows")
export class FollowsController {
	constructor(private readonly followsService: FollowsService) { }

	@Post(":userId")
	async follow(@CurrentUser() user: User, @Param("userId") userId: string) {
		return this.followsService.follow(user.id, userId);
	}

	@Delete(":userId")
	@HttpCode(HttpStatus.NO_CONTENT)
	async unfollow(
		@CurrentUser() user: User,
		@Param("userId") userId: string,
	) {
		await this.followsService.unfollow(user.id, userId);
	}

	@Get("check/:userId")
	async checkFollowing(
		@CurrentUser() user: User,
		@Param("userId") userId: string,
	) {
		const isFollowing = await this.followsService.checkFollowing(
			user.id,
			userId,
		);
		return { isFollowing };
	}

	@Get("followers")
	async getMyFollowers(
		@CurrentUser() user: User,
		@Query() paginationDto: PaginationDto,
	) {
		return this.followsService.getFollowers(user.id, paginationDto);
	}

	@Get("following")
	async getMyFollowing(
		@CurrentUser() user: User,
		@Query() paginationDto: PaginationDto,
	) {
		return this.followsService.getFollowing(user.id, paginationDto);
	}

	@Get("stats")
	async getMyStats(@CurrentUser() user: User) {
		return this.followsService.getFollowStats(user.id);
	}

	@Get("stats/:userId")
	async getUserStats(@Param("userId") userId: string) {
		return this.followsService.getFollowStats(userId);
	}

	@Get(":userId/followers")
	async getUserFollowers(
		@Param("userId") userId: string,
		@Query() paginationDto: PaginationDto,
	) {
		return this.followsService.getFollowers(userId, paginationDto);
	}

	@Get(":userId/following")
	async getUserFollowing(
		@Param("userId") userId: string,
		@Query() paginationDto: PaginationDto,
	) {
		return this.followsService.getFollowing(userId, paginationDto);
	}
}
