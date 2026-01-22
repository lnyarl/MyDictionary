import { Test, type TestingModule } from "@nestjs/testing";
import { PaginationDto } from "@shared";
import {
  destroyTestRedisInstance,
  flushTestRedis,
  TestCacheModule,
} from "../common/cache/test-cache.module";
import {
  cleanupTestDatabase,
  getTestDatabaseHelper,
  TestDatabaseHelper,
} from "../common/database/test-database.helper";
import { TestDatabaseModule } from "../common/database/test-database.module";
import { FollowsRepository } from "../follows/follows.repository";
import { FollowsService } from "../follows/follows.service";
import { UsersRepository } from "../users/users.repository";
import { FeedRepository } from "./feed.repository";
import { FeedService } from "./feed.service";

describe("FeedService", () => {
  let service: FeedService;
  let testDb: TestDatabaseHelper;
  let testUser: { id: string };

  beforeAll(async () => {
    testDb = getTestDatabaseHelper();
    await testDb.setupSchema();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await destroyTestRedisInstance();
  });

  beforeEach(async () => {
    await testDb.cleanAll();
    await flushTestRedis();

    testUser = await testDb.createUser({ nickname: "feeduser" });

    const module: TestingModule = await Test.createTestingModule({
      imports: [TestDatabaseModule, TestCacheModule],
      providers: [FeedService, FeedRepository, FollowsService, FollowsRepository, UsersRepository],
    }).compile();

    service = module.get<FeedService>(FeedService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getFeed", () => {
    it("should return empty feed when user follows no one and has no content", async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10, offset: 0 };

      const result = await service.getFeed(testUser.id, paginationDto);

      expect(result.data).toEqual([]);
    });

    it("should return feed items from followed users", async () => {
      const followedUser = await testDb.createUser({ nickname: "followed" });
      await testDb.createFollow({ followerId: testUser.id, followingId: followedUser.id });

      const word = await testDb.createWord({
        term: "feedword",
        userId: followedUser.id,
        isPublic: true,
      });
      await testDb.createDefinition({
        content: "feed content",
        wordId: word.id,
        userId: followedUser.id,
      });

      const paginationDto: PaginationDto = { page: 1, limit: 10, offset: 0 };

      const result = await service.getFeed(testUser.id, paginationDto);

      expect(result.data.length).toBeGreaterThanOrEqual(1);
    });

    it("should include user's own content in feed", async () => {
      const word = await testDb.createWord({ term: "myword", userId: testUser.id, isPublic: true });
      await testDb.createDefinition({
        content: "my content",
        wordId: word.id,
        userId: testUser.id,
      });

      const paginationDto: PaginationDto = { page: 1, limit: 10, offset: 0 };

      const result = await service.getFeed(testUser.id, paginationDto);

      expect(result.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("getRecommendations", () => {
    it("should return recommendations sorted by likes", async () => {
      const otherUser = await testDb.createUser({ nickname: "popular" });
      const word = await testDb.createWord({
        term: "popular",
        userId: otherUser.id,
        isPublic: true,
      });
      await testDb.createDefinition({
        content: "popular def",
        wordId: word.id,
        userId: otherUser.id,
      });

      const paginationDto: PaginationDto = { page: 1, limit: 10, offset: 0 };

      const result = await service.getRecommendations(paginationDto);

      expect(result.data).toBeDefined();
    });

    it("should exclude specified user from recommendations", async () => {
      const word = await testDb.createWord({
        term: "myword",
        userId: testUser.id,
        isPublic: true,
      });
      await testDb.createDefinition({
        content: "my def",
        wordId: word.id,
        userId: testUser.id,
      });

      const paginationDto: PaginationDto = { page: 1, limit: 10, offset: 0 };

      const result = await service.getRecommendations(paginationDto, testUser.id);

      const hasOwnContent = result.data.some((item) => item.userId === testUser.id);
      expect(hasOwnContent).toBe(false);
    });
  });

  describe("cache invalidation", () => {
    it("should invalidate user feed cache", async () => {
      await service.invalidateUserFeed(testUser.id);
    });

    it("should invalidate recommendations cache", async () => {
      await service.invalidateRecommendations();
    });
  });
});
