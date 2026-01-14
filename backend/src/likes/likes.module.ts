import { Module } from "@nestjs/common";
import { DefinitionsRepository } from "../definitions/definitions.repository";
import { LikesController } from "./likes.controller";
import { LikesRepository } from "./likes.repository";
import { LikesService } from "./likes.service";

@Module({
  controllers: [LikesController],
  providers: [LikesService, LikesRepository, DefinitionsRepository],
  exports: [LikesService],
})
export class LikesModule {}
