import { Inject, Injectable } from "@nestjs/common";
import {
  badges,
  CreateBadgeDto,
  generateId,
  UpdateBadgeDto,
  user_badges,
} from "@stashy/shared";
import { Badges } from "@stashy/shared/types/db_entity.generated";
import { Knex } from "knex";
import { BaseRepository } from "../common/database/base.repository";
import { KNEX_CONNECTION } from "../common/database/knex.provider";

@Injectable()
export class BadgesRepository extends BaseRepository {
  constructor(@Inject(KNEX_CONNECTION) connection: Knex) {
    super(connection);
  }

  async findAll(offset: number, limit: number) {
    const query = this.knex("badges")
      .select<Badges[]>({
        id: "id",
        code: "code",
        name: "name",
        description: "description",
        icon: "icon",
        category: "category",
        eventType: "event_type",
        threshold: "threshold",
        isActive: "is_active",
        createdAt: "created_at",
        updatedAt: "updated_at",
        deletedAt: "deleted_at",
      })
      .orderBy("created_at", "desc")
      .offset(offset)
      .limit(limit);
    const countQuery = this.knex("badges").count<{ count: number }>({
      count: "*",
    });
    return { listQuery: query, countQuery };
  }

  async findById(id: string) {
    return this.knex("badges").where({ id }).first<Badges>();
  }

  async create(dto: CreateBadgeDto): Promise<badges> {
    const [badge] = await this.knex("badges")
      .insert({
        id: generateId(),
        ...dto,
      })
      .returning("*");
    return badge;
  }

  async updateBadge(id: string, dto: UpdateBadgeDto): Promise<badges> {
    const [badge] = await this.knex("badges")
      .where({ id })
      .update({
        ...dto,
        updated_at: new Date(),
      })
      .returning("*");
    return badge;
  }

  async deleteBadge(id: string): Promise<void> {
    await this.knex("badges").where({ id }).delete();
  }

  // User Badge Operations
  async findUserBadges(userId: string): Promise<user_badges[]> {
    return this.knex("user_badges")
      .select(
        `user_badges.*`,
        `badges.name as badge_name`,
        `badges.code as badge_code`,
      )
      .join("badges", `user_badges.badge_id`, `badges.id`)
      .where({ user_id: userId });
  }

  async grantBadge(userId: string, badgeId: string): Promise<user_badges> {
    const [userBadge] = await this.knex("user_badges")
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
    await this.knex("user_badges")
      .where({ user_id: userId, badge_id: badgeId })
      .delete();
  }

  async hasBadge(userId: string, badgeId: string): Promise<boolean> {
    const result = await this.knex("user_badges")
      .where({ user_id: userId, badge_id: badgeId })
      .first();
    return !!result;
  }
}
