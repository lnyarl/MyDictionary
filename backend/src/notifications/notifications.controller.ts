import { Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { PaginatedResponseDto, PaginationDto } from "@shared";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { Notification } from "./entities/notification.entity";
import { NotificationsService, NotificationWithActor } from "./notifications.service";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @CurrentUser("id") userId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<NotificationWithActor>> {
    return this.notificationsService.getNotifications(userId, paginationDto);
  }

  @Get("unread-count")
  async getUnreadCount(@CurrentUser("id") userId: string): Promise<{ count: number }> {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Patch(":id/read")
  async markAsRead(
    @CurrentUser("id") userId: string,
    @Param("id") notificationId: string,
  ): Promise<Notification> {
    return this.notificationsService.markAsRead(userId, notificationId);
  }

  @Patch("read-all")
  async markAllAsRead(@CurrentUser("id") userId: string): Promise<void> {
    return this.notificationsService.markAllAsRead(userId);
  }
}
