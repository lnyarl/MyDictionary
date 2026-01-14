import { Module } from "@nestjs/common";
import { knexProvider } from "src/common/database/knex.provider";
import { FollowsController } from "./follows.controller";
import { FollowsService } from "./follows.service";

@Module({
  controllers: [FollowsController],
  providers: [knexProvider, FollowsService],
  exports: [FollowsService],
})
export class FollowsModule {}
