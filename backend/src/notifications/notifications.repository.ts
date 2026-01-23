import { Injectable } from "@nestjs/common";
import { generateId, TABLES } from "@shared";
import { UserSelect } from "@shared/entities/user.entity";
import { BaseRepository } from "../common/database/base.repository";
import { Notification, NotificationSelect, NotificationType } from "./entities/notification.entity";

@Injectable()
export class NotificationsRepository extends BaseRepository {
  private tableName = TABLES.NOTIFICATIONS;

  findByUserId(userId: string, offset: number, limit: number) {
    const baseQuery = this.query(this.tableName).where({ user_id: userId });

    const listQuery = baseQuery
      .clone()
      .leftJoin(TABLES.USERS, `${this.tableName}.actor_id`, `${TABLES.USERS}.id`)
      .select(
        Object.keys(NotificationSelect).reduce(
          (acc, key) => {
            acc[key] = `${this.tableName}.${NotificationSelect[key]}`;
            return acc;
          },
          {} as Record<string, string>,
        ),
      )
      .select(
        Object.keys(UserSelect).reduce(
          (acc, key) => {
            acc[`actor_${key}`] = `${TABLES.USERS}.${UserSelect[key]}`;
            return acc;
          },
          {} as Record<string, string>,
        ),
      )
      .orderBy(`${this.tableName}.created_at`, "desc")
      .offset(offset)
      .limit(limit);

    const countQuery = baseQuery.clone().count<{ count: number }>("id as count").first();

    return { listQuery, countQuery };
  }

  findById(id: string): Promise<Notification | null> {
    return this.query(this.tableName).select(NotificationSelect).where({ id }).first();
  }

  getUnreadCount(userId: string): Promise<{ count: number }> {
    return this.query(this.tableName)
      .where({ user_id: userId, is_read: false })
      .count<{ count: number }>("id as count")
      .first();
  }

  markAsRead(id: string): Promise<Notification | null> {
    return this.update<Notification>(this.tableName, id, { is_read: true });
  }

  markAllAsRead(userId: string): Promise<void> {
    return this.knex(this.tableName)
      .where({ user_id: userId, is_read: false })
      .whereNull("deleted_at")
      .update({ is_read: true, updated_at: new Date() });
  }

  delete(id: string): Promise<void> {
    return this.softDelete(this.tableName, id);
  }

  create(notification: {
    userId: string;
    type: NotificationType;
    title: string;
    message?: string;
    actorId?: string;
    targetUrl?: string;
  }): Promise<Notification[]> {
    const now = new Date();
    return this.knex(this.tableName)
      .insert({
        id: generateId(),
        user_id: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message || null,
        actor_id: notification.actorId || null,
        target_url: notification.targetUrl || null,
        is_read: false,
        created_at: now,
        updated_at: now,
      })
      .returning([
        "id",
        "user_id as userId",
        "type",
        "title",
        "message",
        "actor_id as actorId",
        "target_url as targetUrl",
        "is_read as isRead",
        "created_at as createdAt",
        "updated_at as updatedAt",
      ]);
  }
}
