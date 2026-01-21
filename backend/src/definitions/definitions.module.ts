import { forwardRef, Module } from "@nestjs/common";
import { CommonModule } from "../common/common.module";
import { FeedModule } from "../feed/feed.module";
import { WordsRepository } from "../words/words.repository";
import { DefinitionsController } from "./definitions.controller";
import { DefinitionsRepository } from "./definitions.repository";
import { DefinitionsService } from "./definitions.service";

@Module({
  imports: [forwardRef(() => FeedModule), CommonModule],
  controllers: [DefinitionsController],
  providers: [DefinitionsService, DefinitionsRepository, WordsRepository],
  exports: [DefinitionsService],
})
export class DefinitionsModule {}
