import { Module } from "@nestjs/common";
import { knexProvider } from "../common/database/knex.provider";
import { FollowsModule } from "../follows/follows.module";
import { WordsRepository } from "../words/words.repository";
import { UsersController } from "./users.controller";
import { UsersRepository } from "./users.repository";
import { UsersService } from "./users.service";

@Module({
  imports: [FollowsModule],
  providers: [knexProvider, UsersService, UsersRepository, WordsRepository],
  controllers: [UsersController],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
