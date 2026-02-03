import { Inject, Injectable } from "@nestjs/common";
import {
  BadgeEntity,
  CreateBadgeDto,
  generateId,
  TABLES,
  TableName,
  UpdateBadgeDto,
  UserBadgeEntity,
} from "@stashy/shared";
import { Knex } from "knex";
import { BaseRepository } from "../common/database/base.repository";
import { KNEX_CONNECTION } from "../common/database/knex.provider";

@Injectable()
export class BadgesRepository extends BaseRepository {
  private tableName: TableName = TABLES.BADGES;

  constructor(@Inject(KNEX_CONNECTION) connection: Knex) {
    super(connection);
  }

  async findAll(offset: number, limit: number) {
    const query = this.knex(this.tableName)
      .select("*")
      .orderBy("created_at", "desc")
      .offset(offset)
      .limit(limit);
    const countQuery = this.knex(this.tableName).count("* as count").first();
    return { listQuery: query, countQuery };
  }

  async findById(id: string): Promise<BadgeEntity | undefined> {
    return this.knex(this.tableName).where({ id }).first();
  }

  async create(dto: CreateBadgeDto): Promise<BadgeEntity> {
    const [badge] = await this.knex(this.tableName)
      .insert({
        id: generateId(),
        ...dto,
      })
      .returning("*");
    return badge;
  }

  async updateBadge(id: string, dto: UpdateBadgeDto): Promise<BadgeEntity> {
    const [badge] = await this.knex(this.tableName)
      .where({ id })
      .update({
        ...dto,
        updated_at: new Date(),
      })
      .returning("*");
    return badge;
  }

  async deleteBadge(id: string): Promise<void> {
    await this.knex(this.tableName).where({ id }).delete();
  }

  // User Badge Operations
  async findUserBadges(userId: string): Promise<UserBadgeEntity[]> {
    return this.knex(TABLES.USER_BADGES)
      .select(
        `${TABLES.USER_BADGES}.*`,
        `${TABLES.BADGES}.name as badge_name`,
        `${TABLES.BADGES}.code as badge_code`,
      )
      .join(
        TABLES.BADGES,
        `${TABLES.USER_BADGES}.badge_id`,
        `${TABLES.BADGES}.id`,
      )
      .where({ user_id: userId });
  }

  async grantBadge(userId: string, badgeId: string): Promise<UserBadgeEntity> {
    const [userBadge] = await this.knex(TABLES.USER_BADGES)
      .insert({
        id: generateId(),
        user_id: userId,
        badge_id: badgeId,
        earned_at: new Date(),
      })
      .returning("*");
    return userBadge;
  }

  async revokeBadge(userId: string, badgeId: string): Promise<void> {
    await this.knex(TABLES.USER_BADGES)
      .where({ user_id: userId, badge_id: badgeId })
      .delete();
  }

  async hasBadge(userId: string, badgeId: string): Promise<boolean> {
    const result = await this.knex(TABLES.USER_BADGES)
      .where({ user_id: userId, badge_id: badgeId })
      .first();
    return !!result;
  }
}
