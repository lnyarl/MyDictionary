import { Controller, Get, Query } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { PaginationDto } from "../common/dto/pagination.dto";
import { User } from "../users/entities/user.entity";
import { FeedService } from "./feed.service";

@Controller()
export class FeedController {
  constructor(private readonly feedService: FeedService) { }

  @Get("/feed")
  async getFeed(@CurrentUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.feedService.getFeed(user.id, paginationDto);
  }

  @Get("/feed/all")
  async getAllFeed(@Query() paginationDto: PaginationDto) {
    return this.feedService.getAllFeeds(paginationDto);
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
