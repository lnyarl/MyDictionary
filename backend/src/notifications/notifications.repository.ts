import { Injectable } from "@nestjs/common";
import { generateId } from "@stashy/shared";
import { BaseRepository } from "../common/database/base.repository";
import { Notification, NotificationSelect, NotificationType } from "./entities/notification.entity";

@Injectable()
export class NotificationsRepository extends BaseRepository {
  findByUserId(userId: string, limit: number, cursor?: string) {
    const baseQuery = this.query("notifications").where({ user_id: userId });

    if (cursor) {
      baseQuery.where(`notifications.created_at`, "<", cursor);
    }

    const listQuery = baseQuery
      .clone()
      .leftJoin("users", `notifications.actor_id`, `notifications.id`)
      .select({
        ...NotificationSelect,
        nickname: "users.nickname",
        profilePicture: "users.profile_picture",
      })
      .orderBy(`notifications.created_at`, "desc")
      .limit(limit);

    return listQuery;
  }

  findById(id: string): Promise<Notification | null> {
    return this.query("notifications").select(NotificationSelect).where({ id }).first();
  }

  getUnreadCount(userId: string) {
    return this.query("notifications")
      .where({ user_id: userId, is_read: false })
      .count<{ count: number }>("* as count")
      .first();
  }

  markAsRead(id: string) {
    return this.query("notifications").where({ id: id }).update({ is_read: true }).returning("*");
  }

  markAllAsRead(userId: string): Promise<void> {
    return this.knex("notifications")
      .where({ user_id: userId, is_read: false })
      .whereNull("deleted_at")
      .update({ is_read: true, updated_at: new Date() });
  }

  remove(id: string) {
    return this.softDelete("notifications", id);
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
    return this.knex("notifications")
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
