import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PaginatedResponseDto, PaginationDto } from "@stashy/shared";
import { NotificationType } from "../notifications/entities/notification.entity";
import { NotificationsService } from "../notifications/notifications.service";
import { User } from "../users/entities/user.entity";
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
        return this.followRepository.findById(existingFollow.id);
      }
      throw new BadRequestException("Already following this user");
    }

    const result = await this.followRepository.create({
      followerId,
      followingId,
    });

    const follower = await this.userRepository.findById(followerId);
    if (follower) {
      await this.notificationsService.createNotification({
        userId: followingId,
        type: NotificationType.FOLLOW,
        title: `${follower.nickname}님이 회원님을 팔로우하기 시작했습니다`,
        actorId: followerId,
        targetUrl: `/users/${followerId}`,
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
  }

  async checkFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followRepository.findExistingFollow(followerId, followingId);
    return !!follow && !follow.deletedAt;
  }

  async getFollowers(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<User>> {
    const followers = await this.followRepository.findFollowers(
      userId,
      paginationDto.limit || 20,
      paginationDto.cursor,
    );
    const nextCursor =
      followers.length > 0 ? (followers[followers.length - 1].followCreatedAt as any) : undefined;

    return new PaginatedResponseDto<User>(
      followers,
      paginationDto.page || 1,
      paginationDto.limit || 20,
      nextCursor,
    );
  }

  async getFollowing(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<User>> {
    const followings = await this.followRepository.findFollowings(
      userId,
      paginationDto.limit || 20,
      paginationDto.cursor,
    );

    const nextCursor =
      followings.length > 0
        ? (followings[followings.length - 1].followCreatedAt as any)
        : undefined;

    return new PaginatedResponseDto<User>(
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
