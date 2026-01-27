import { Controller, Param, Post } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { User } from "../users/entities/user.entity";
import { LikesService } from "./likes.service";

@Controller()
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post("/likes/:definitionId")
  async toggle(@Param("definitionId") definitionId: string, @CurrentUser() user: User) {
    const liked = await this.likesService.toggle(user.id, definitionId);
    return { liked };
  }
}
