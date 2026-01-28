export type NotificationType = "follow" | "like" | "badge";

export interface NotificationActor {
  id: string;
  nickname: string;
  profilePicture: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string | null;
  actorId: string | null;
  targetUrl: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  actor?: NotificationActor;
}

export interface NotificationsResponse {
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    nextCursor?: string;
  };
}

export interface UnreadCountResponse {
  count: number;
}
