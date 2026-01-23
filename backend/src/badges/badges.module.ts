import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module";
import { BadgesController } from "./badges.controller";
import { BadgesRepository } from "./badges.repository";
import { BadgesService } from "./badges.service";

@Module({
  imports: [NotificationsModule],
  controllers: [BadgesController],
  providers: [BadgesService, BadgesRepository],
  exports: [BadgesService],
})
export class BadgesModule {}
