import { forwardRef, Module } from "@nestjs/common";
import { FeedModule } from "../feed/feed.module";
import { WordsRepository } from "../words/words.repository";
import { DefinitionsController } from "./definitions.controller";
import { DefinitionsRepository } from "./definitions.repository";
import { DefinitionsService } from "./definitions.service";

@Module({
  imports: [forwardRef(() => FeedModule)],
  controllers: [DefinitionsController],
  providers: [DefinitionsService, DefinitionsRepository, WordsRepository],
  exports: [DefinitionsService],
})
export class DefinitionsModule {}
