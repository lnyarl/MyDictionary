import type {
	Notification,
	NotificationsResponse,
	UnreadCountResponse,
} from "../types/notification.types";
import { api } from "./api";

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
