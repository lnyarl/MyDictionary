import { Controller, Get, Param, Post } from "@nestjs/common";
import { AdminRole } from "../admin-users/entities/admin-user.entity";
import { Roles } from "../auth/decorators/roles.decorator";
import { WordsService } from "./words.service";

@Controller("users/:userId/words")
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get()
  async getWords(@Param("userId") userId: string) {
    return this.wordsService.getWordsByUserId(userId);
  }

  @Post("dummy")
  @Roles(AdminRole.DEVELOPER)
  async createDummyWord(@Param("userId") userId: string) {
    return this.wordsService.createDummyWord(userId);
  }
}
