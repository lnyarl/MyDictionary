import { Module } from "@nestjs/common";
import { knexProvider } from "../common/database/knex.provider";
import { LikesController } from "./likes.controller";
import { LikesRepository } from "./likes.repository";
import { LikesService } from "./likes.service";

@Module({
  controllers: [LikesController],
  providers: [knexProvider, LikesService, LikesRepository],
  exports: [LikesService],
})
export class LikesModule {}
