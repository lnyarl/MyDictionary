import { forwardRef, Module } from "@nestjs/common";
import { FollowsModule } from "../follows/follows.module";
import { FeedController } from "./feed.controller";
import { FeedRepository } from "./feed.repository";
import { FeedService } from "./feed.service";
import { DefinitionsModule } from "../definitions/definitions.module";

@Module({
  imports: [FollowsModule, forwardRef(() => DefinitionsModule)],
  controllers: [FeedController],
  providers: [FeedService, FeedRepository],
  exports: [FeedService],
})
export class FeedModule {}
