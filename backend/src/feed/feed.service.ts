import { Injectable } from "@nestjs/common";
import { PaginatedResponseDto, PaginationDto } from "@shared";
import { CacheService } from "../common/cache/cache.service";
import { FollowsService } from "../follows/follows.service";
import { Feed } from "./entities/feed.entity";
import { FeedRepository } from "./feed.repository";

@Injectable()
export class FeedService {
  private readonly FEED_CACHE_TTL = 10;
  private readonly RECOMMENDATIONS_CACHE_TTL = 300;

  constructor(
    private readonly feedRepository: FeedRepository,
    private readonly followsService: FollowsService,
    private readonly cacheService: CacheService,
  ) {}

  async getFeed(userId: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<Feed>> {
    const cacheKey = this.cacheService.feedKey(userId, paginationDto.page, paginationDto.limit);
    const cached = await this.cacheService.get<PaginatedResponseDto<Feed>>(cacheKey);

    if (cached) {
      return cached;
    }

    const followingIds = await this.followsService.getFollowingIds(userId);
    const userIds = [...followingIds, userId];

    const { listQuery, countQuery } = await this.feedRepository.findFeeds(
      userIds,
      paginationDto.offset,
      paginationDto.limit,
    );

    const feeds = await listQuery;
    const count = (await countQuery)?.count ?? 0;

    const dto = new PaginatedResponseDto<Feed>(
      feeds,
      count,
      paginationDto.page,
      paginationDto.limit,
    );
    await this.cacheService.set(cacheKey, dto, this.FEED_CACHE_TTL);
    return dto;
  }

  async getAllFeeds(paginationDto: PaginationDto) {
    const cacheKey = this.cacheService.allFeedKey(paginationDto.page);
    const cached = await this.cacheService.get<Feed[]>(cacheKey);

    if (cached) {
      return new PaginatedResponseDto<Feed>(cached, 0, paginationDto.page, paginationDto.limit);
    }

    const feeds = await this.feedRepository.findAllFeeds(paginationDto.offset, paginationDto.limit);

    await this.cacheService.set(cacheKey, feeds, this.FEED_CACHE_TTL);

    return new PaginatedResponseDto<Feed>(feeds, 0, paginationDto.page, paginationDto.limit);
  }

  async getRecommendations(
    paginationDto: PaginationDto,
    excludeUserId?: string,
  ): Promise<PaginatedResponseDto<Feed>> {
    const cacheKey = this.cacheService.recommendationsKey(paginationDto.page);
    const cached = await this.cacheService.get<Feed[]>(cacheKey);

    if (cached && !excludeUserId) {
      return new PaginatedResponseDto<Feed>(cached, 0, paginationDto.page, paginationDto.limit);
    }

    const recommendations = await this.feedRepository.findRecommendations(
      paginationDto.offset,
      paginationDto.limit,
      excludeUserId,
    );

    if (!excludeUserId) {
      await this.cacheService.set(cacheKey, recommendations, this.RECOMMENDATIONS_CACHE_TTL);
    }

    return new PaginatedResponseDto<Feed>(
      recommendations,
      0,
      paginationDto.page,
      paginationDto.limit,
    );
  }

  async invalidateUserFeed(userId: string): Promise<void> {
    await this.cacheService.deletePattern(this.cacheService.feedPattern(userId));
  }

  async invalidateFollowerFeeds(authorId: string): Promise<void> {
    const followerIds = await this.followsService.getFollowerIds(authorId);
    await Promise.all(followerIds.map((id) => this.invalidateUserFeed(id)));
  }

  async invalidateRecommendations(): Promise<void> {
    await this.cacheService.deletePattern(this.cacheService.recommendationsPattern());
  }
}
