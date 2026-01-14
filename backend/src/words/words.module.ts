import { Module } from "@nestjs/common";
import { knexProvider } from "src/common/database/knex.provider";
import { DefinitionsModule } from "src/definitions/definitions.module";
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
