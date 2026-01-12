import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { PaginatedResponseDto, PaginationDto } from "../common/dto/pagination.dto";
import { User } from "../users/entities/user.entity";
import { Follow } from "./entities/follow.entity";

@Injectable()
export class FollowsService {
	constructor(
		@InjectRepository(Follow)
		private readonly followRepository: Repository<Follow>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) { }

	async follow(followerId: string, followingId: string): Promise<Follow> {
		// Prevent self-follow
		if (followerId === followingId) {
			throw new BadRequestException("Cannot follow yourself");
		}

		// Check if user exists
		const userToFollow = await this.userRepository.findOne({
			where: { id: followingId },
		});
		if (!userToFollow) {
			throw new NotFoundException("User not found");
		}

		// Check for existing follow (including soft-deleted)
		const existingFollow = await this.followRepository.findOne({
			where: { followerId, followingId },
			withDeleted: true,
		});

		if (existingFollow) {
			if (existingFollow.deletedAt) {
				// Restore soft-deleted follow
				await this.followRepository.restore(existingFollow.id);
				return this.followRepository.findOne({
					where: { id: existingFollow.id },
				});
			}
			throw new BadRequestException("Already following this user");
		}

		// Create new follow
		const follow = this.followRepository.create({
			followerId,
			followingId,
		});
		return this.followRepository.save(follow);
	}

	async unfollow(followerId: string, followingId: string): Promise<void> {
		const follow = await this.followRepository.findOne({
			where: { followerId, followingId },
		});

		if (!follow) {
			throw new NotFoundException("Follow relationship not found");
		}

		await this.followRepository.softDelete(follow.id);
	}

	async checkFollowing(
		followerId: string,
		followingId: string,
	): Promise<boolean> {
		const follow = await this.followRepository.findOne({
			where: { followerId, followingId },
		});
		return !!follow;
	}

	async getFollowers(
		userId: string,
		paginationDto: PaginationDto,
	): Promise<PaginatedResponseDto<User>> {
		const queryBuilder = this.followRepository
			.createQueryBuilder("follow")
			.leftJoinAndSelect("follow.follower", "follower")
			.where("follow.following_id = :userId", { userId })
			.skip(paginationDto.offset)
			.take(paginationDto.limit);

		const [follows, total] = await queryBuilder.getManyAndCount();
		const users = follows.map((follow) => follow.follower);

		return new PaginatedResponseDto<User>(
			users,
			total,
			paginationDto.page,
			paginationDto.limit,
		);
	}

	async getFollowing(
		userId: string,
		paginationDto: PaginationDto,
	): Promise<PaginatedResponseDto<User>> {
		const queryBuilder = this.followRepository
			.createQueryBuilder("follow")
			.leftJoinAndSelect("follow.following", "following")
			.where("follow.follower_id = :userId", { userId })
			.skip(paginationDto.offset)
			.take(paginationDto.limit);

		const [follows, total] = await queryBuilder.getManyAndCount();
		const users = follows.map((follow) => follow.following);

		return new PaginatedResponseDto<User>(
			users,
			total,
			paginationDto.page,
			paginationDto.limit,
		);
	}

	async getFollowStats(
		userId: string,
	): Promise<{ followersCount: number; followingCount: number }> {
		const followersCount = await this.followRepository.count({
			where: { followingId: userId },
		});

		const followingCount = await this.followRepository.count({
			where: { followerId: userId },
		});

		return { followersCount, followingCount };
	}

	async getFollowingIds(userId: string): Promise<string[]> {
		const follows = await this.followRepository.find({
			where: { followerId: userId },
			select: ["followingId"],
		});
		return follows.map((follow) => follow.followingId);
	}
}
