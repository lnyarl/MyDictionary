import { Inject, Injectable } from "@nestjs/common";
import { generateId } from "@stashy/shared";
import { Badges } from "@stashy/shared/types/db_entity.generated";
import { Knex } from "knex";
import { BaseRepository } from "../common/database/base.repository";
import { KNEX_CONNECTION } from "../common/database/knex.provider";

@Injectable()
export class BadgesRepository extends BaseRepository {
  constructor(@Inject(KNEX_CONNECTION) connection: Knex) {
    super(connection);
  }

  findAllBadgesWithStatus(userId: string) {
    return this.query("badges")
      .select<
        {
          id: string;
          code: string;
          name: string;
          description: string | null;
          icon: string | null;
          category: string;
          event_type: string;
          earnedAt: Date;
          currentCount: number;
          isEarned: boolean;
        }[]
      >(
        "badges.id",
        "badges.code",
        "badges.name",
        "badges.description",
        "badges.icon",
        "badges.category",
        "badges.event_type as eventType",
        "user_badges.earned_at as earnedAt",
        this.knex.raw<number>(`COALESCE(user_badge_progress.count, 0) as currentCount`),
        this.knex.raw<boolean>(
          `CASE WHEN user_badges.id IS NOT NULL THEN true ELSE false END as isEarned`,
        ),
      )
      .leftJoin("user_badges", (join) => {
        join.on(`badges.id`, `=`, `user_badges.badge_id`).andOn(`user_badge.user_id`, `=`, userId);
      })
      .leftJoin("user_badge_progress", (join) => {
        join
          .on(`badges.event_type`, `=`, `user_badge_progress.event_type`)
          .andOn(`user_badge_progress.user_id`, `=`, userId);
      })
      .orderBy(`badges.category`)
      .orderBy(`badges.threshold`);
  }

  findBadgesByEventType(eventType: string) {
    return this.query("badges").where({ event_type: eventType, is_active: true }).select<Badges[]>({
      id: "id",
      code: "code",
      name: "name",
      description: "description",
      icon: "icon",
      category: "category",
      eventType: "event_type",
      threshold: "threshold",
      isActive: "is_active",
    });
  }

  hasUserEarnedBadge(userId: string, badgeId: string) {
    return this.query("user_badges")
      .where({ user_id: userId, badge_id: badgeId })
      .select("id")
      .first();
  }

  createUserBadge(userId: string, badgeId: string) {
    return this.knex("user_badges").insert({
      id: generateId(),
      user_id: userId,
      badge_id: badgeId,
    });
  }

  updateUserProgress(userId: string, eventType: string, increment: number = 1) {
    return this.knex("user_badge_progress")
      .insert({
        user_id: userId,
        event_type: eventType,
        count: increment,
        last_updated: new Date(),
      })
      .onConflict(["user_id", "event_type"])
      .merge({
        count: this.knex.raw("user_badge_progress.count + ?", [increment]),
        last_updated: new Date(),
      })
      .returning("count");
  }
}
