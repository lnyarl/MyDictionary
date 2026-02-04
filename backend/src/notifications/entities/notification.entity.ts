import { User } from "../../users/entities/user.entity";

export enum NotificationType {
  FOLLOW = "follow",
  LIKE = "like",
  BADGE = "badge",
}

export class Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string | null;
  actorId: string | null;
  targetUrl: string | null;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  actor?: User;
}

export const NotificationSelect = {
  id: "notifications.id",
  userId: "notifications.user_id",
  type: "notifications.type",
  title: "notifications.title",
  message: "notifications.message",
  actorId: "notifications.actor_id",
  targetUrl: "notifications.target_url",
  isRead: "notifications.is_read",
  createdAt: "notifications.created_at",
  updatedAt: "notifications.updated_at",
  deletedAt: "notifications.deleted_at",
} as const;
