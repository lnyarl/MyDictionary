import { Module } from "@nestjs/common";
import { UsersRepository } from "../users/users.repository";
import { FollowsController } from "./follows.controller";
import { FollowsRepository } from "./follows.repository";
import { FollowsService } from "./follows.service";

@Module({
  controllers: [FollowsController],
  providers: [FollowsService, FollowsRepository, UsersRepository],
  exports: [FollowsService],
})
export class FollowsModule {}
