import { create } from "zustand";
import { notificationsApi } from "@/lib/api/notifications";

interface NotificationStore {
  unreadCount: number;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  unreadCount: 0,

  setUnreadCount: (count) => set({ unreadCount: count }),

  fetchUnreadCount: async () => {
    try {
      const response = await notificationsApi.getUnreadCount();
      set({ unreadCount: response.count });
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  },

  markAsRead: async (id: string) => {
    const currentCount = get().unreadCount;
    if (currentCount > 0) {
      set({ unreadCount: currentCount - 1 });
    }

    try {
      await notificationsApi.markAsRead(id);
    } catch (error) {
      set({ unreadCount: currentCount });
      console.error("Failed to mark as read:", error);
    }
  },

  markAllAsRead: async () => {
    const currentCount = get().unreadCount;
    set({ unreadCount: 0 });

    try {
      await notificationsApi.markAllAsRead();
    } catch (error) {
      set({ unreadCount: currentCount });
      console.error("Failed to mark all as read:", error);
    }
  },
}));
