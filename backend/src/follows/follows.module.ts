import { forwardRef, Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module";
import { UsersRepository } from "../users/users.repository";
import { FollowsController } from "./follows.controller";
import { FollowsRepository } from "./follows.repository";
import { FollowsService } from "./follows.service";

@Module({
  imports: [forwardRef(() => NotificationsModule)],
  controllers: [FollowsController],
  providers: [FollowsService, FollowsRepository, UsersRepository],
  exports: [FollowsService],
})
export class FollowsModule {}
