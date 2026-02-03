import { api } from "./api";

export type Badge = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string;
  event_type: string;
  threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type UserBadge = {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
};

export type BadgeWithProgress = Badge & {
  earned_at?: string;
  current_count: number;
  is_earned: boolean;
};

export const badgesApi = {
  getMyBadges: () => api.get<BadgeWithProgress[]>("/badges/my"),
  getUserBadges: (userId: string) => api.get<BadgeWithProgress[]>(`/badges/user/${userId}`),
};
