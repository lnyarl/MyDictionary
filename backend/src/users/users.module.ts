import { Module } from "@nestjs/common";
import { DefinitionsRepository } from "../definitions/definitions.repository";
import { FollowsModule } from "../follows/follows.module";
import { WordsRepository } from "../words/words.repository";
import { UsersController } from "./users.controller";
import { UsersRepository } from "./users.repository";
import { UsersService } from "./users.service";

@Module({
  imports: [FollowsModule],
  providers: [UsersService, UsersRepository, WordsRepository, DefinitionsRepository],
  controllers: [UsersController],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
