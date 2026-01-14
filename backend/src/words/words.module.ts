import { Module } from "@nestjs/common";
import { knexProvider } from "../common/database/knex.provider";
import { DefinitionsModule } from "../definitions/definitions.module";
import { WordsController } from "./words.controller";
import { WordsRepository } from "./words.repository";
import { WordsService } from "./words.service";

@Module({
  imports: [DefinitionsModule],
  providers: [knexProvider, WordsService, WordsRepository],
  controllers: [WordsController],
  exports: [WordsService, WordsRepository],
})
export class WordsModule {}
