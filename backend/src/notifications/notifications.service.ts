import { Injectable, NotFoundException } from "@nestjs/common";
import { PaginatedResponseDto, PaginationDto } from "@stashy/shared";
import { Notification, NotificationType } from "./entities/notification.entity";
import { NotificationsRepository } from "./notifications.repository";

export interface NotificationWithActor extends Omit<Notification, "actor"> {
  actor?: {
    id: string;
    nickname: string;
    profilePicture: string | null;
  };
}

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsRepository: NotificationsRepository) {}

  async getNotifications(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<NotificationWithActor>> {
    const listQuery = this.notificationsRepository.findByUserId(
      userId,
      paginationDto.limit || 20,
      paginationDto.cursor,
    );

    const notifications = await listQuery;

    const mappedNotifications: NotificationWithActor[] = notifications.map((row: any) => ({
      id: row.id,
      userId: row.userId,
      type: row.type,
      title: row.title,
      message: row.message,
      actorId: row.actorId,
      targetUrl: row.targetUrl,
      isRead: row.isRead,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
      actor: row.actorId
        ? {
            id: row.actorId,
            nickname: row.nickname,
            profilePicture: row.profilePicture,
          }
        : undefined,
    }));

    const nextCursor =
      mappedNotifications.length > 0
        ? (mappedNotifications[mappedNotifications.length - 1].createdAt as any)
        : undefined;

    return new PaginatedResponseDto<NotificationWithActor>(
      mappedNotifications,
      paginationDto.page || 1,
      paginationDto.limit || 20,
      nextCursor,
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await this.notificationsRepository.getUnreadCount(userId);
    return Number(result?.count || 0);
  }

  async markAsRead(userId: string, notificationId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findById(notificationId);

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException("Notification not found");
    }

    await this.notificationsRepository.markAsRead(notificationId);
    return { ...notification, isRead: true };
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.markAllAsRead(userId);
  }

  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message?: string;
    actorId?: string;
    targetUrl?: string;
  }): Promise<Notification> {
    const [notification] = await this.notificationsRepository.create(data);
    return notification;
  }
}
