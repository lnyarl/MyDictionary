import { BadRequestException, Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { PaginationDto } from "@stashy/shared";
import { CreateWordDto } from "@stashy/shared/dto/word/create-word.dto";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { LikesService } from "../likes/likes.service";
import { User } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";
import { FeedService } from "./feed.service";

@Controller()
export class FeedController {
  constructor(
    private readonly userService: UsersService,
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
      feeds.data.map((i) => i.id),
      user.id,
    );
    for (var feed of feeds.data) {
      feed.isLiked = likes[feed.id]?.isLiked;
      feed.likesCount = likes[feed.id]?.likesCount;
    }

    return feeds;
  }

  @Get("/feed/me")
  async getMyFeed(@CurrentUser() user: User, @Query() paginationDto: PaginationDto) {
    const feeds = await this.feedService.getMyFeed(user.id, paginationDto);
    const likes = await this.likeService.getLikeInfoByDefinitions(
      feeds.data.map((i) => i.id),
      user.id,
    );
    for (var feed of feeds.data) {
      feed.isLiked = likes[feed.id]?.isLiked;
      feed.likesCount = likes[feed.id]?.likesCount;
    }

    return feeds;
  }

  @Get("/feed/user/:nickname")
  async getUserFeed(@Param("nickname") nickname: string, @Query() paginationDto: PaginationDto) {
    if (!nickname) {
      throw new BadRequestException("nickname required");
    }
    const user = await this.userService.getUserByNickname(nickname);
    const feeds = await this.feedService.getUserFeed(user.id, paginationDto);
    const likes = await this.likeService.getLikeInfoByDefinitions(
      feeds.data.map((i) => i.id),
      user.id,
    );
    for (var feed of feeds.data) {
      feed.isLiked = likes[feed.id]?.isLiked;
      feed.likesCount = likes[feed.id]?.likesCount;
    }

    return feeds;
  }

  @Get("/feed/all")
  async getAllFeed(@CurrentUser() user: User, @Query() paginationDto: PaginationDto) {
    const feeds = await this.feedService.getAllFeeds(user.id, paginationDto);
    const likes = await this.likeService.getLikeInfoByDefinitions(
      feeds.data.map((i) => i.id),
      user.id,
    );
    for (var feed of feeds.data) {
      feed.isLiked = likes[feed.id]?.isLiked;
      feed.likesCount = likes[feed.id]?.likesCount;
    }

    return feeds;
  }

  @Get("/feed/recommendations")
  async getRecommendations(
    @CurrentUser() user: User | null,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.feedService.getRecommendations(paginationDto, user?.id);
  }

  @Get("/feed/search/:term")
  async getFeedByTerm(
    @CurrentUser() user: User | null,
    @Param("term") term: string,
    @Query() paginationDto: PaginationDto,
  ) {
    if (!term) {
      throw new BadRequestException("Term is required");
    }

    const feeds = await this.feedService.getFeedByTerm(term, paginationDto);

    if (feeds.data.length > 0) {
      const likes = await this.likeService.getLikeInfoByDefinitions(
        feeds.data.map((i) => i.id),
        user?.id,
      );

      for (const feed of feeds.data) {
        feed.isLiked = likes[feed.id]?.isLiked;
        feed.likesCount = likes[feed.id]?.likesCount;
      }
    }

    return feeds;
  }

  @Get("/feed/tag/:tag")
  @Public()
  async getFeedsByTag(
    @CurrentUser() user: User | null,
    @Param("tag") tag: string,
    @Query() paginationDto: PaginationDto,
  ) {
    if (!tag) {
      throw new BadRequestException("Tag is required");
    }

    const feeds = await this.feedService.getFeedsByTag(tag, paginationDto);

    if (feeds.data.length > 0) {
      const likes = await this.likeService.getLikeInfoByDefinitions(
        feeds.data.map((i) => i.id),
        user?.id,
      );

      for (const feed of feeds.data) {
        feed.isLiked = likes[feed.id]?.isLiked;
        feed.likesCount = likes[feed.id]?.likesCount;
      }
    }

    return feeds;
  }
}
