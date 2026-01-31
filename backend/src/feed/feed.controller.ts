import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ERROR_CODES, PaginationDto } from "@stashy/shared";
import { CreateWordDto } from "@stashy/shared/dto/word/create-word.dto";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { LikesService } from "../likes/likes.service";
import { User } from "../users/entities/user.entity";
import { FeedService } from "./feed.service";

@Controller()
export class FeedController {
  constructor(
    private readonly feedService: FeedService,
    private readonly likeService: LikesService,
  ) {}

  @Post("/feed")
  async createFeed(@CurrentUser() user: User, @Body() createWordDto: CreateWordDto) {
    return await this.feedService.createFeed(user.id, createWordDto);
  }

  @Get("/feed")
  async getFeed(@CurrentUser() user: User, @Query() paginationDto: PaginationDto) {
    const feeds = await this.feedService.getFeed(user.id, paginationDto);
    const likes = await this.likeService.getLikeInfoByDefinitions(
      user.id,
      feeds.data.map((i) => i.id),
    );
    for (var feed of feeds.data) {
      feed.isLiked = likes[feed.id].isLiked;
      feed.likesCount = likes[feed.id].likeCount;
    }

    return feeds;
  }

  @Get("/feed/me")
  async getMyFeed(@CurrentUser() user: User, @Query() paginationDto: PaginationDto) {
    const feeds = await this.feedService.getMyFeed(user.id, paginationDto);
    const likes = await this.likeService.getLikeInfoByDefinitions(
      user.id,
      feeds.data.map((i) => i.id),
    );
    for (var feed of feeds.data) {
      feed.isLiked = likes[feed.id].isLiked;
      feed.likesCount = likes[feed.id].likeCount;
    }

    return feeds;
  }

  @Get("/feed/all")
  async getAllFeed(@CurrentUser() user: User, @Query() paginationDto: PaginationDto) {
    const feeds = await this.feedService.getAllFeeds(user.id, paginationDto);
    const likes = await this.likeService.getLikeInfoByDefinitions(
      user.id,
      feeds.data.map((i) => i.id),
    );
    for (var feed of feeds.data) {
      feed.isLiked = likes[feed.id].isLiked;
      feed.likesCount = likes[feed.id].likeCount;
    }

    return feeds;
  }

  @Get("/feed/recommendations")
  @Public()
  async getRecommendations(
    @CurrentUser() user: User | null,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.feedService.getRecommendations(paginationDto, user?.id);
  }
}
