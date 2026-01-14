import { Module } from "@nestjs/common";
import { FollowsModule } from "../follows/follows.module";
import { FeedController } from "./feed.controller";
import { FeedRepository } from "./feed.repository";
import { FeedService } from "./feed.service";

@Module({
  imports: [FollowsModule],
  controllers: [FeedController],
  providers: [FeedService, FeedRepository],
  exports: [FeedService],
})
export class FeedModule {}
