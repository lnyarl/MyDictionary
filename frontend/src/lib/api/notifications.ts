import { api } from "./api";

export type NotificationType = "follow" | "like" | "badge";

export type NotificationActor = {
  id: string;
  nickname: string;
  profilePicture: string | null;
};

export type Notification = {
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
};

export type NotificationsResponse = {
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    nextCursor?: string;
  };
};

export type UnreadCountResponse = {
  count: number;
};

export const notificationsApi = {
  getNotifications: (page = 1, limit = 10, cursor?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (cursor) params.append("cursor", cursor);
    return api.get<NotificationsResponse>(`/notifications?${params.toString()}`);
  },

  getUnreadCount: () => api.get<UnreadCountResponse>("/notifications/unread-count"),

  markAsRead: (notificationId: string) =>
    api.patch<Notification>(`/notifications/${notificationId}/read`, {}),

  markAllAsRead: () => api.patch<void>("/notifications/read-all", {}),
};
