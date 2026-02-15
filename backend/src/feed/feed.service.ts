import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { PaginatedResponseDto, PaginationDto } from "@stashy/shared";
import { CreateWordDto } from "@stashy/shared/dto/word/create-word.dto";
import { CacheService } from "../common/cache/cache.service";
import { EventEmitterService } from "../common/events";
import { DefinitionsService } from "../definitions/definitions.service";
import { FollowsService } from "../follows/follows.service";
import { Word } from "../words/entities/word.entity";
import { Feed } from "./entities/feed.entity";
import { FeedRepository } from "./feed.repository";

@Injectable()
export class FeedService {
  private readonly FEED_CACHE_TTL = 30;
  private readonly ALL_FEED_CACHE_TTL = 2;
  private readonly RECOMMENDATIONS_CACHE_TTL = 300;

  constructor(
    private readonly feedRepository: FeedRepository,
    private readonly followsService: FollowsService,
    @Inject(forwardRef(() => DefinitionsService))
    private readonly definitionsService: DefinitionsService,
    private readonly cacheService: CacheService,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  async createFeed(userId: string, createWordDto: CreateWordDto): Promise<Feed> {
    return await this.feedRepository.transaction(async (knex) => {
      // Ensure term exists and get number
      let termNumber: number;
      const termRecord = await this.feedRepository.findTerm(createWordDto.term).transacting(knex);

      if (termRecord) {
        termNumber = termRecord.number;
      } else {
        try {
          const newTerms = await this.feedRepository
            .createTerm(createWordDto.term)
            .transacting(knex);
          termNumber = newTerms[0].number;
        } catch (error) {
          // If concurrent creation happened, fetch the term again
          const existing = await this.feedRepository.findTerm(createWordDto.term).transacting(knex);
          if (!existing) {
            throw error;
          }
          termNumber = existing.number;
        }
      }

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
        await this.eventEmitter.emitWordCreate(userId, word.id, word.term);
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
        termNumber,
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
    const nextCursor = feeds.length > 0 ? String(feeds[feeds.length - 1].createdAt) : undefined;

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
    const nextCursor = feeds.length > 0 ? String(feeds[feeds.length - 1].createdAt) : undefined;

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
    const nextCursor = feeds.length > 0 ? String(feeds[feeds.length - 1].createdAt) : undefined;

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
    const nextCursor = feeds.length > 0 ? String(feeds[feeds.length - 1].createdAt) : undefined;

    const dto = new PaginatedResponseDto<Feed>(
      feeds,
      paginationDto.page || 1,
      paginationDto.limit || 20,
      nextCursor,
    );

    await this.cacheService.set(cacheKey, dto, this.ALL_FEED_CACHE_TTL);

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
        ? String(recommendations[recommendations.length - 1].createdAt)
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

  async invalidateMyFeed(userId: string): Promise<void> {
    await this.cacheService.deletePattern(this.cacheService.myFeedPattern(userId));
  }

  async invalidateFollowerFeeds(authorId: string): Promise<void> {
    const followerIds = await this.followsService.getFollowerIds(authorId);
    await Promise.all(followerIds.map((id) => this.invalidateUserFeed(id)));
  }

  async invalidateRecommendations(): Promise<void> {
    await this.cacheService.deletePattern(this.cacheService.recommendationsPattern());
  }

  async getFeedByTerm(
    term: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Feed>> {
    const cacheKey = `feed:term:${term}:${paginationDto.page || 1}:${paginationDto.limit || 20}:${paginationDto.cursor || ""}`;
    const cached = await this.cacheService.get<PaginatedResponseDto<Feed>>(cacheKey);

    if (cached) {
      return cached;
    }

    const feeds = await this.feedRepository.findFeedByTerm(
      term,
      paginationDto.limit || 20,
      paginationDto.cursor,
    );

    const nextCursor = feeds.length > 0 ? String(feeds[feeds.length - 1].createdAt) : undefined;

    const dto = new PaginatedResponseDto<Feed>(
      feeds,
      paginationDto.page || 1,
      paginationDto.limit || 20,
      nextCursor,
    );

    await this.cacheService.set(cacheKey, dto, this.ALL_FEED_CACHE_TTL);

    return dto;
  }

  async getFeedsByTag(
    tag: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Feed>> {
    const cacheKey = `feed:tag:${tag}:${paginationDto.page || 1}:${paginationDto.limit || 20}:${paginationDto.cursor || ""}`;
    const cached = await this.cacheService.get<PaginatedResponseDto<Feed>>(cacheKey);

    if (cached) {
      return cached;
    }

    const feeds = await this.feedRepository.findFeedsByTag(
      tag,
      paginationDto.limit || 20,
      paginationDto.cursor,
    );

    const nextCursor = feeds.length > 0 ? String(feeds[feeds.length - 1].createdAt) : undefined;

    const dto = new PaginatedResponseDto<Feed>(
      feeds,
      paginationDto.page || 1,
      paginationDto.limit || 20,
      nextCursor,
    );

    await this.cacheService.set(cacheKey, dto, this.ALL_FEED_CACHE_TTL);

    return dto;
  }

  async getLikedFeeds(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Feed>> {
    const feeds = await this.feedRepository.findLikedFeeds(
      userId,
      paginationDto.limit || 20,
      paginationDto.cursor,
    );

    const nextCursor = feeds.length > 0 ? String(feeds[feeds.length - 1].createdAt) : undefined;

    return new PaginatedResponseDto<Feed>(
      feeds,
      paginationDto.page || 1,
      paginationDto.limit || 20,
      nextCursor,
    );
  }
}
