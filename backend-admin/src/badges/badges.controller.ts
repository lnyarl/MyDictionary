import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { CreateBadgeDto, PaginationDto, UpdateBadgeDto } from "@stashy/shared";
import { BadgesService } from "./badges.service";

@Controller("badges")
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Post()
  create(@Body() createBadgeDto: CreateBadgeDto) {
    return this.badgesService.create(createBadgeDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.badgesService.findAll(paginationDto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.badgesService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateBadgeDto: UpdateBadgeDto) {
    return this.badgesService.update(id, updateBadgeDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.badgesService.remove(id);
  }

  @Get("users/:userId")
  getUserBadges(@Param("userId") userId: string) {
    return this.badgesService.getUserBadges(userId);
  }

  @Post("users/:userId/grant/:badgeId")
  grantBadge(
    @Param("userId") userId: string,
    @Param("badgeId") badgeId: string,
  ) {
    return this.badgesService.grantBadge(userId, badgeId);
  }

  @Delete("users/:userId/revoke/:badgeId")
  revokeBadge(
    @Param("userId") userId: string,
    @Param("badgeId") badgeId: string,
  ) {
    return this.badgesService.revokeBadge(userId, badgeId);
  }
}
