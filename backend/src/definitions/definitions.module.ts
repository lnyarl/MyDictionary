import { Module } from "@nestjs/common";
import { WordsRepository } from "../words/words.repository";
import { DefinitionsController } from "./definitions.controller";
import { DefinitionsRepository } from "./definitions.repository";
import { DefinitionsService } from "./definitions.service";

@Module({
  controllers: [DefinitionsController],
  providers: [DefinitionsService, DefinitionsRepository, WordsRepository],
  exports: [DefinitionsService],
})
export class DefinitionsModule {}
