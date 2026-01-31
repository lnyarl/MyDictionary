import { BullModule } from "@nestjs/bullmq";
import { forwardRef, Module } from "@nestjs/common";
import { DefinitionsRepository } from "../definitions/definitions.repository";
import { NotificationsModule } from "../notifications/notifications.module";
import { UsersRepository } from "../users/users.repository";
import { WordsRepository } from "../words/words.repository";
import { LikeProcessor } from "./like.processor";
import { LikesController } from "./likes.controller";
import { LikesRepository } from "./likes.repository";
import { LikesService } from "./likes.service";

@Module({
  imports: [
    forwardRef(() => NotificationsModule),
    BullModule.registerQueue({
      name: "likes",
    }),
  ],
  controllers: [LikesController],
  providers: [
    LikesService,
    LikesRepository,
    DefinitionsRepository,
    UsersRepository,
    WordsRepository,
    LikeProcessor,
  ],
  exports: [LikesService],
})
export class LikesModule {}
