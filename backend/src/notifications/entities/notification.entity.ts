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
  id: "id",
  userId: "user_id",
  type: "type",
  title: "title",
  message: "message",
  actorId: "actor_id",
  targetUrl: "target_url",
  isRead: "is_read",
  createdAt: "created_at",
  updatedAt: "updated_at",
  deletedAt: "deleted_at",
} as const;
