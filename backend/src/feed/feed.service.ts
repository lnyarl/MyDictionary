import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { PaginatedResponseDto, PaginationDto } from "@stashy/shared";
import { CreateWordDto } from "@stashy/shared/dto/word/create-word.dto";
import { CacheService } from "../common/cache/cache.service";
import { DefinitionsService } from "../definitions/definitions.service";
import { FollowsService } from "../follows/follows.service";
import { UsersRepository } from "../users/users.repository";
import { Word } from "../words/entities/word.entity";
import { Feed } from "./entities/feed.entity";
import { FeedRepository } from "./feed.repository";

@Injectable()
export class FeedService {
  private readonly FEED_CACHE_TTL = 10;
  private readonly RECOMMENDATIONS_CACHE_TTL = 300;

  constructor(
    private readonly userRepository: UsersRepository,
    private readonly feedRepository: FeedRepository,
    private readonly followsService: FollowsService,
    @Inject(forwardRef(() => DefinitionsService))
    private readonly definitionsService: DefinitionsService,
    private readonly cacheService: CacheService,
  ) {}

  async createFeed(userId: string, createWordDto: CreateWordDto): Promise<Feed> {
    return await this.feedRepository.transaction(async (knex) => {
      let word: Word;
      const existWord = await this.feedRepository
        .findWordByTerm(userId, createWordDto.term)
        .transacting(knex);
      if (!existWord) {
        const result = await this.feedRepository
          .createWord({
            term: createWordDto.term,
            userId,
          })
          .transacting(knex);
        word = result[0];
      } else {
        word = existWord;
      }
      const definition = await this.definitionsService.create(
        userId,
        word,
        {
          ...createWordDto.definition,
          wordId: word.id,
        },
        [],
        knex,
      );
      return {
        ...word,
        ...definition,
      } as Feed;
    });
  }

  async getMyFeed(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Feed>> {
    const cacheKey = this.cacheService.myFeedKey(
      userId,
      paginationDto.page || 1,
      paginationDto.limit || 20,
      paginationDto.cursor,
    );
    const cached = await this.cacheService.get<PaginatedResponseDto<Feed>>(cacheKey);

    if (cached) {
      return cached;
    }

    const listQuery = await this.feedRepository.findUserFeeds(
      userId,
      true,
      paginationDto.limit || 20,
      paginationDto.cursor,
    );

    const feeds = await listQuery;
    const nextCursor = feeds.length > 0 ? (feeds[feeds.length - 1].createdAt as any) : undefined;

    const dto = new PaginatedResponseDto<Feed>(
      feeds,
      paginationDto.page || 1,
      paginationDto.limit || 20,
      nextCursor,
    );
    await this.cacheService.set(cacheKey, dto, this.FEED_CACHE_TTL);
    return dto;
  }

  async getUserFeed(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Feed>> {
    const cacheKey = this.cacheService.myFeedKey(
      userId,
      paginationDto.page || 1,
      paginationDto.limit || 20,
      paginationDto.cursor,
    );
    const cached = await this.cacheService.get<PaginatedResponseDto<Feed>>(cacheKey);

    if (cached) {
      return cached;
    }

    const listQuery = await this.feedRepository.findUserFeeds(
      userId,
      false,
      paginationDto.limit || 20,
      paginationDto.cursor,
    );

    const feeds = await listQuery;
    const nextCursor = feeds.length > 0 ? (feeds[feeds.length - 1].createdAt as any) : undefined;

    const dto = new PaginatedResponseDto<Feed>(
      feeds,
      paginationDto.page || 1,
      paginationDto.limit || 20,
      nextCursor,
    );
    await this.cacheService.set(cacheKey, dto, this.FEED_CACHE_TTL);
    return dto;
  }

  async getFeed(userId: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<Feed>> {
    const cacheKey = this.cacheService.feedKey(
      userId,
      paginationDto.page || 1,
      paginationDto.limit || 20,
      paginationDto.cursor,
    );
    const cached = await this.cacheService.get<PaginatedResponseDto<Feed>>(cacheKey);

    if (cached) {
      return cached;
    }

    const followingIds = await this.followsService.getFollowingIds(userId);
    const userIds = [...followingIds];

    const listQuery = await this.feedRepository.findFeeds(
      userIds,
      paginationDto.limit || 20,
      paginationDto.cursor,
    );

    const feeds = await listQuery;
    const nextCursor = feeds.length > 0 ? (feeds[feeds.length - 1].createdAt as any) : undefined;

    const dto = new PaginatedResponseDto<Feed>(
      feeds,
      paginationDto.page || 1,
      paginationDto.limit || 20,
      nextCursor,
    );
    await this.cacheService.set(cacheKey, dto, this.FEED_CACHE_TTL);
    return dto;
  }

  async getAllFeeds(userId: string, paginationDto: PaginationDto) {
    const cacheKey = this.cacheService.allFeedKey(
      paginationDto.page || 1,
      paginationDto.cursor || "",
    );
    const cached = await this.cacheService.get<PaginatedResponseDto<Feed>>(cacheKey);

    if (cached) {
      return cached;
    }

    const feeds = await this.feedRepository.findAllFeeds(
      userId,
      paginationDto.limit || 20,
      paginationDto.cursor,
    );
    const nextCursor = feeds.length > 0 ? (feeds[feeds.length - 1].createdAt as any) : undefined;

    const dto = new PaginatedResponseDto<Feed>(
      feeds,
      paginationDto.page || 1,
      paginationDto.limit || 20,
      nextCursor,
    );

    await this.cacheService.set(cacheKey, dto, this.FEED_CACHE_TTL);

    return dto;
  }

  async getRecommendations(
    paginationDto: PaginationDto,
    excludeUserId?: string,
  ): Promise<PaginatedResponseDto<Feed>> {
    const cacheKey = this.cacheService.recommendationsKey(
      paginationDto.page || 1,
      paginationDto.cursor || "",
    );
    const cached = await this.cacheService.get<PaginatedResponseDto<Feed>>(cacheKey);

    if (cached && !excludeUserId) {
      return cached;
    }

    const recommendations = await this.feedRepository.findRecommendations(
      paginationDto.limit || 20,
      paginationDto.cursor,
      excludeUserId,
    );

    const nextCursor =
      recommendations.length > 0
        ? (recommendations[recommendations.length - 1].createdAt as any)
        : undefined;

    const dto = new PaginatedResponseDto<Feed>(
      recommendations,
      paginationDto.page || 1,
      paginationDto.limit || 20,
      nextCursor,
    );

    if (!excludeUserId) {
      await this.cacheService.set(cacheKey, dto, this.RECOMMENDATIONS_CACHE_TTL);
    }

    return dto;
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
