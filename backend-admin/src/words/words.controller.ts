import { Controller, Get, Param, Post } from "@nestjs/common";
import { AdminRole } from "@stashy/shared/admin/entities/admin-user.entity";
import { Roles } from "../auth/decorators/roles.decorator";
import { WordsService } from "./words.service";

@Controller()
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}

  @Get("/users/:userId/words")
  async getWords(@Param("userId") userId: string) {
    return this.wordsService.getWordsByUserId(userId);
  }

  @Post("/users/:userId/words/dummy")
  @Roles(AdminRole.DEVELOPER)
  async createDummyWord(@Param("userId") userId: string) {
    return this.wordsService.createDummyWord(userId);
  }
}
