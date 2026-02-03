import {
	type BadgeEntity,type BadgeEntity, 
	type CreateBadgeDto,type CreateBadgeDto, 
	type PaginatedResponseDto,type PaginatedResponseDto, 
	PaginationDto,
	type UpdateBadgeDto,type UpdateBadgeDto, 
	type UserBadgeEntity,type UserBadgeEntity 
} from "@stashy/shared";
import { api } from "./api";

export const badgesApi = {
  findAll: async (page: number, limit: number) => {
    return api.get<PaginatedResponseDto<BadgeEntity>>(`/badges?page=${page}&limit=${limit}`);
  },
  create: async (dto: CreateBadgeDto) => {
    return api.post<BadgeEntity>("/badges", dto);
  },
  update: async (id: string, dto: UpdateBadgeDto) => {
    return api.patch<BadgeEntity>(`/badges/${id}`, dto);
  },
  delete: async (id: string) => {
    return api.delete(`/badges/${id}`);
  },
  getUserBadges: async (userId: string) => {
    return api.get<(UserBadgeEntity & { badge_name: string, badge_code: string })[]>(`/badges/users/${userId}`);
  },
  grantBadge: async (userId: string, badgeId: string) => {
    return api.post<UserBadgeEntity>(`/badges/users/${userId}/grant/${badgeId}`, {});
  },
  revokeBadge: async (userId: string, badgeId: string) => {
    return api.delete(`/badges/users/${userId}/revoke/${badgeId}`);
  }
};

