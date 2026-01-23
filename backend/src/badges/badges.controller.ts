import { Controller, Get, Param } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { User } from "../users/entities/user.entity";
import { BadgesService } from "./badges.service";

@Controller("badges")
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get("my")
  async getMyBadges(@CurrentUser() user: User) {
    return this.badgesService.getMyBadges(user.id);
  }

  @Public()
  @Get("user/:userId")
  async getUserBadges(@Param("userId") userId: string) {
    return this.badgesService.getUserBadges(userId);
  }
}
