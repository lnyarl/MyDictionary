import { forwardRef, Module } from "@nestjs/common";
import { CommonModule } from "../common/common.module";
import { DefinitionHistoriesRepository } from "../definition-histories/definition-histories.repository";
import { FeedModule } from "../feed/feed.module";
import { DefinitionsController } from "./definitions.controller";
import { DefinitionsRepository } from "./definitions.repository";
import { DefinitionsService } from "./definitions.service";
import { WordsRepository } from "../words/words.repository";

@Module({
  imports: [forwardRef(() => FeedModule), CommonModule],
  controllers: [DefinitionsController],
  providers: [
    DefinitionsService,
    DefinitionsRepository,
    WordsRepository,
    DefinitionHistoriesRepository,
  ],
  exports: [DefinitionsService],
})
export class DefinitionsModule {}
