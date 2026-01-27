import { Inject, Injectable } from "@nestjs/common";
import { TABLES, TableName } from "@stashy/shared";
import { Knex } from "knex";
import { BaseRepository } from "../common/database/base.repository";
import { KNEX_CONNECTION } from "../common/database/knex.provider";
import {
  BadgeEntity,
  BadgeWithProgress,
  UserBadgeEntity,
  UserBadgeProgressEntity,
} from "./entities/badge.entity";

@Injectable()
export class BadgesRepository extends BaseRepository {
  private tableName: TableName = TABLES.BADGES;

  constructor(@Inject(KNEX_CONNECTION) connection: Knex) {
    super(connection);
  }

  async findAllBadgesWithStatus(userId: string): Promise<BadgeWithProgress[]> {
    const badges = await this.knex(this.tableName)
      .select(
        `${this.tableName}.*`,
        `${TABLES.USER_BADGES}.earned_at`,
        this.knex.raw(`COALESCE(${TABLES.USER_BADGE_PROGRESS}.count, 0) as current_count`),
        this.knex.raw(
          `CASE WHEN ${TABLES.USER_BADGES}.id IS NOT NULL THEN true ELSE false END as is_earned`,
        ),
      )
      .leftJoin(TABLES.USER_BADGES, (join) => {
        join
          .on(`${this.tableName}.id`, `=`, `${TABLES.USER_BADGES}.badge_id`)
          .andOn(`${TABLES.USER_BADGES}.user_id`, `=`, this.knex.raw("?", [userId]));
      })
      .leftJoin(TABLES.USER_BADGE_PROGRESS, (join) => {
        join
          .on(`${this.tableName}.event_type`, `=`, `${TABLES.USER_BADGE_PROGRESS}.event_type`)
          .andOn(`${TABLES.USER_BADGE_PROGRESS}.user_id`, `=`, this.knex.raw("?", [userId]));
      })
      .orderBy(`${this.tableName}.category`)
      .orderBy(`${this.tableName}.threshold`);

    return badges;
  }

  async findBadgesByEventType(eventType: string): Promise<BadgeEntity[]> {
    return this.query(this.tableName).where({ event_type: eventType, is_active: true });
  }

  async hasUserEarnedBadge(userId: string, badgeId: string): Promise<boolean> {
    const result = await this.knex(TABLES.USER_BADGES)
      .where({ user_id: userId, badge_id: badgeId })
      .first();
    return !!result;
  }

  async createUserBadge(userId: string, badgeId: string): Promise<UserBadgeEntity> {
    const [userBadge] = await this.knex(TABLES.USER_BADGES)
      .insert({
        user_id: userId,
        badge_id: badgeId,
      })
      .returning("*");
    return userBadge;
  }

  async updateUserProgress(
    userId: string,
    eventType: string,
    increment: number = 1,
  ): Promise<UserBadgeProgressEntity> {
    const query = `
      INSERT INTO ${TABLES.USER_BADGE_PROGRESS} (user_id, event_type, count, last_updated)
      VALUES (?, ?, ?, NOW())
      ON CONFLICT (user_id, event_type)
      DO UPDATE SET 
        count = ${TABLES.USER_BADGE_PROGRESS}.count + ?,
        last_updated = NOW()
      RETURNING *
    `;

    const { rows } = await this.knex.raw(query, [userId, eventType, increment, increment]);
    return rows[0];
  }
}
