import { Controller, Get, Query } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { PaginationDto } from "../common/dto/pagination.dto";
import { User } from "../users/entities/user.entity";
import { FeedService } from "./feed.service";

@Controller("feed")
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  async getFeed(@CurrentUser() user: User, @Query() paginationDto: PaginationDto) {
    return this.feedService.getFeed(user.id, paginationDto);
  }
}
