import type {
	Notification,
	NotificationsResponse,
	UnreadCountResponse,
} from "../types/notification.types";
import { api } from "./api";

export const notificationsApi = {
	getNotifications: (page = 1, limit = 10) =>
		api.get<NotificationsResponse>(`/notifications?page=${page}&limit=${limit}`),

	getUnreadCount: () => api.get<UnreadCountResponse>("/notifications/unread-count"),

	markAsRead: (notificationId: string) =>
		api.patch<Notification>(`/notifications/${notificationId}/read`, {}),

	markAllAsRead: () => api.patch<void>("/notifications/read-all", {}),
};
