import type { BadgeWithProgress } from "../types/badge.types";
import { api } from "./api";

export const badgesApi = {
	getMyBadges: () => api.get<BadgeWithProgress[]>("/badges/my"),
	getUserBadges: (userId: string) => api.get<BadgeWithProgress[]>(`/badges/user/${userId}`),
};
