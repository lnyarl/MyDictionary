import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { PaginationDto } from "../common/dto/pagination.dto";
import { User } from "../users/entities/user.entity";
import { FollowsService } from "./follows.service";

@Controller()
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post("follows/:userId")
  async follow(@CurrentUser() user: User, @Param("userId") userId: string) {
    return this.followsService.follow(user.id, userId);
  }

  @Delete("follows/:userId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async unfollow(@CurrentUser() user: User, @Param("userId") userId: string) {
    await this.followsService.unfollow(user.id, userId);
  }

  @Get("follows/check/:userId")
  async checkFollowing(@CurrentUser() user: User, @Param("userId") userId: string) {
    const isFollowing = await this.followsService.checkFollowing(user.id, userId);
    return { isFollowing };
  }

  @Get("follows/followers")
  async getMyFollowers(@CurrentUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.followsService.getFollowers(user.id, paginationDto);
  }

  @Get("follows/following")
  async getMyFollowing(@CurrentUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.followsService.getFollowing(user.id, paginationDto);
  }

  @Get("follows/stats")
  async getMyStats(@CurrentUser() user: User) {
    return this.followsService.getFollowStats(user.id);
  }

  @Get("follows/stats/:userId")
  async getUserStats(@Param("userId") userId: string) {
    return this.followsService.getFollowStats(userId);
  }

  @Get("follows/:userId/followers")
  async getUserFollowers(@Param("userId") userId: string, @Query() paginationDto: PaginationDto) {
    return this.followsService.getFollowers(userId, paginationDto);
  }

  @Get("follows/:userId/following")
  async getUserFollowing(@Param("userId") userId: string, @Query() paginationDto: PaginationDto) {
    return this.followsService.getFollowing(userId, paginationDto);
  }
}
