import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ERROR_CODES, PaginationDto } from "@stashy/shared";
import { CreateWordDto } from "@stashy/shared/dto/word/create-word.dto";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { badRequest } from "../common/exceptions/business.exception";
import { User } from "../users/entities/user.entity";
import { FeedService } from "./feed.service";

@Controller()
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Post("/feed")
  async createFeed(@CurrentUser() user: User, @Body() createWordDto: CreateWordDto) {
    return await this.feedService.createFeed(user.id, createWordDto);
  }

  @Get("/feed")
  async getFeed(@CurrentUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.feedService.getFeed(user.id, paginationDto);
  }

  @Get("/feed/me")
  async getMyFeed(@CurrentUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.feedService.getMyFeed(user.id, paginationDto);
  }

  @Get("/feed/all")
  async getAllFeed(@CurrentUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.feedService.getAllFeeds(user.id, paginationDto);
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
