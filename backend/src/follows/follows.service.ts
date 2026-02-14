import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PaginatedResponseDto, PaginationDto } from "@stashy/shared";
import { Users } from "@stashy/shared/types/db_entity.generated";
import { EventEmitterService } from "../common/events/event-emitter.service";
import { NotificationType } from "../notifications/entities/notification.entity";
import { NotificationsService } from "../notifications/notifications.service";
import { UsersRepository } from "../users/users.repository";
import { Follow } from "./entities/follow.entity";
import { FollowsRepository } from "./follows.repository";

@Injectable()
export class FollowsService {
  constructor(
    private readonly followRepository: FollowsRepository,
    private readonly userRepository: UsersRepository,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  async follow(followerId: string, followingId: string): Promise<Follow> {
    // Prevent self-follow
    if (followerId === followingId) {
      throw new BadRequestException("Cannot follow yourself");
    }

    // Check if user exists
    const userToFollow = await this.userRepository.findById(followingId);
    if (!userToFollow) {
      throw new NotFoundException("User not found");
    }

    // Check for existing follow (including soft-deleted)
    const existingFollow = await this.followRepository.findExistingFollow(followerId, followingId);

    if (existingFollow) {
      if (existingFollow.deletedAt) {
        // Restore soft-deleted follow
        await this.followRepository.restoreRelation(existingFollow.id);
        await this.eventEmitter.emitFollow(followerId, followingId);
        return this.followRepository.findById(existingFollow.id);
      }
      throw new BadRequestException("Already following this user");
    }

    const result = await this.followRepository.create({
      followerId,
      followingId,
    });

    await this.eventEmitter.emitFollow(followerId, followingId);

    const follower = await this.userRepository.findById(followerId);
    if (follower) {
      await this.notificationsService.createNotification({
        userId: followingId,
        type: NotificationType.FOLLOW,
        title: `${follower.nickname}님이 회원님을 팔로우하기 시작했습니다`,
        actorId: followerId,
        targetUrl: `/profile/${follower.nickname}`,
      });
    }

    return result[0];
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    const follow = await this.followRepository.findExistingFollow(followerId, followingId);
    if (!follow || follow.deletedAt) {
      throw new NotFoundException("Follow relationship not found");
    }

    await this.followRepository.delete(follow.id);
    await this.eventEmitter.emitUnfollow(followerId, followingId);
  }

  async checkFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followRepository.findExistingFollow(followerId, followingId);
    return !!follow && !follow.deletedAt;
  }

  async getFollowers(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Users>> {
    const followers = await this.followRepository.findFollowers(
      userId,
      paginationDto.limit || 20,
      paginationDto.cursor,
    );
    const nextCursor =
      followers.length > 0 ? (followers[followers.length - 1].followCreatedAt as any) : undefined;

    return new PaginatedResponseDto<Users & { followCreatedAt: Date }>(
      followers,
      paginationDto.page || 1,
      paginationDto.limit || 20,
      nextCursor,
    );
  }

  async getFollowing(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Users>> {
    const followings = await this.followRepository.findFollowings(
      userId,
      paginationDto.limit || 20,
      paginationDto.cursor,
    );

    const nextCursor =
      followings.length > 0
        ? (followings[followings.length - 1].followCreatedAt as any)
        : undefined;

    return new PaginatedResponseDto<Users>(
      followings,
      paginationDto.page || 1,
      paginationDto.limit || 20,
      nextCursor,
    );
  }

  async getFollowStats(
    userId: string,
  ): Promise<{ followersCount: number; followingCount: number }> {
    const [followersCount, followingCount] = await Promise.all([
      this.followRepository.getFollowerCount(userId),
      this.followRepository.getFollowingCount(userId),
    ]);

    return {
      followersCount: Number(followersCount.count),
      followingCount: Number(followingCount.count),
    };
  }

  async getFollowingIds(userId: string): Promise<string[]> {
    const followIds = await this.followRepository.findFollowingIds(userId);
    return followIds;
  }

  async getFollowerIds(userId: string): Promise<string[]> {
    return this.followRepository.findFollowerIds(userId);
  }
}
