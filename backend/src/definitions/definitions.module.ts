import { forwardRef, Module } from "@nestjs/common";
import { CommonModule } from "../common/common.module";
import { DefinitionHistoriesRepository } from "../definition-histories/definition-histories.repository";
import { FeedModule } from "../feed/feed.module";
import { LikesModule } from "../likes/likes.module";
import { WordsRepository } from "../words/words.repository";
import { DefinitionsController } from "./definitions.controller";
import { DefinitionsRepository } from "./definitions.repository";
import { DefinitionsService } from "./definitions.service";

@Module({
  imports: [forwardRef(() => FeedModule), CommonModule, LikesModule],
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
