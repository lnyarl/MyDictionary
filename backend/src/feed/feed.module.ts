import { forwardRef, Module } from "@nestjs/common";
import { DefinitionsModule } from "../definitions/definitions.module";
import { FollowsModule } from "../follows/follows.module";
import { LikesModule } from "../likes/likes.module";
import { UsersModule } from "../users/users.module";
import { FeedController } from "./feed.controller";
import { FeedRepository } from "./feed.repository";
import { FeedService } from "./feed.service";

@Module({
  imports: [UsersModule, FollowsModule, forwardRef(() => DefinitionsModule), LikesModule],
  controllers: [FeedController],
  providers: [FeedService, FeedRepository],
  exports: [FeedService],
})
export class FeedModule {}
