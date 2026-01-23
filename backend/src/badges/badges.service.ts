import { Injectable, Logger } from "@nestjs/common";
import { NotificationType } from "../notifications/entities/notification.entity";
import { NotificationsService } from "../notifications/notifications.service";
import { BadgesRepository } from "./badges.repository";
import { BadgeEntity, BadgeWithProgress } from "./entities/badge.entity";

@Injectable()
export class BadgesService {
  private readonly logger = new Logger(BadgesService.name);

  constructor(
    private readonly badgesRepository: BadgesRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getMyBadges(userId: string): Promise<BadgeWithProgress[]> {
    return this.badgesRepository.findAllBadgesWithStatus(userId);
  }

  async getUserBadges(userId: string): Promise<BadgeWithProgress[]> {
    return this.badgesRepository.findAllBadgesWithStatus(userId);
  }

  async updateProgressAndCheckBadges(userId: string, eventType: string): Promise<BadgeEntity[]> {
    const progress = await this.badgesRepository.updateUserProgress(userId, eventType);
    const potentialBadges = await this.badgesRepository.findBadgesByEventType(eventType);

    const earnedBadges: BadgeEntity[] = [];

    for (const badge of potentialBadges) {
      if (progress.count >= badge.threshold) {
        const hasEarned = await this.badgesRepository.hasUserEarnedBadge(userId, badge.id);

        if (!hasEarned) {
          await this.badgesRepository.createUserBadge(userId, badge.id);
          earnedBadges.push(badge);

          this.logger.log(`User ${userId} earned badge ${badge.name} (${badge.code})`);

          await this.notificationsService.createNotification({
            userId,
            type: NotificationType.BADGE,
            title: "새로운 뱃지 획득!",
            message: `'${badge.name}' 뱃지를 획득했습니다.`,
            targetUrl: `/profile?tab=badges`,
          });
        }
      }
    }

    return earnedBadges;
  }
}
