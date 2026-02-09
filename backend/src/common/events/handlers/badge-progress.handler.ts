import { Injectable, Logger } from "@nestjs/common";
import { EventType } from "@stashy/shared/entities/event.entity";
import { BadgesService } from "../../../badges/badges.service";
import { EventMessage, EventPayload, FollowEventPayload, LikeEventPayload } from "../event.types";
import { EventHandler } from "./event-handler.interface";

@Injectable()
export class BadgeProgressHandler implements EventHandler {
  private readonly logger = new Logger(BadgeProgressHandler.name);

  constructor(private readonly badgesService: BadgesService) {}

  readonly supportedEvents = [
    EventType.WORD_CREATE,
    EventType.DEFINITION_CREATE,
    EventType.USER_FOLLOW,
    EventType.DEFINITION_LIKE,
    EventType.USER_DAILY_LOGIN,
    EventType.USER_LOGIN_STREAK,
  ];

  async handle(message: EventMessage<EventPayload>): Promise<void> {
    try {
      this.logger.debug(`Received event ${message.type} for badge processing`);
      await this.processBadgeProgress(message.type as EventType, message.payload);
    } catch (error) {
      this.logger.error(`Failed to process badge progress for event ${message.type}:`, error);
    }
  }

  private async processBadgeProgress(eventType: EventType, payload: EventPayload): Promise<void> {
    let targetUserId: string;
    let badgeEventType: string;

    switch (eventType) {
      case EventType.WORD_CREATE:
        targetUserId = payload.userId;
        badgeEventType = "word_create";
        break;

      case EventType.DEFINITION_CREATE:
        targetUserId = payload.userId;
        badgeEventType = "definition_create";
        break;

      case EventType.USER_FOLLOW:
        targetUserId = (payload as FollowEventPayload).targetUserId;
        badgeEventType = "user_followed";
        break;

      case EventType.DEFINITION_LIKE:
        targetUserId = (payload as LikeEventPayload).definitionOwnerId;
        badgeEventType = "like_received";
        break;

      case EventType.USER_DAILY_LOGIN:
        targetUserId = payload.userId;
        badgeEventType = "user_daily_login";
        break;

      case EventType.USER_LOGIN_STREAK:
        targetUserId = payload.userId;
        badgeEventType = "user_login_streak";
        break;

      default:
        return;
    }

    if (!targetUserId) {
      this.logger.warn(`No target user ID found for event ${eventType}`);
      return;
    }

    await this.badgesService.updateProgressAndCheckBadges(targetUserId, badgeEventType);
  }
}
