import { Test, type TestingModule } from "@nestjs/testing";
import { PaginationDto } from "@shared";
import { FollowsRepository } from "../follows/follows.repository";
import { FollowsService } from "../follows/follows.service";
import { NotificationsRepository } from "../notifications/notifications.repository";
import { NotificationsService } from "../notifications/notifications.service";
import {
  destroyTestRedisInstance,
  flushTestRedis,
  TestCacheModule,
  testRedisProvider,
} from "../test/helper/test-cache.module";
import {
  cleanupTestDatabase,
  getTestDatabaseHelper,
  TestDatabaseHelper,
} from "../test/helper/test-database.helper";
import { TestDatabaseModule, testKnexProvider } from "../test/helper/test-database.module";
import { UsersRepository } from "../users/users.repository";
import { FeedRepository } from "./feed.repository";
import { FeedService } from "./feed.service";
import { DefinitionsService } from "../definitions/definitions.service";
import { WordsRepository } from "../words/words.repository";
import { MetadataService } from "../common/services/metadata.service";
import { FeedModule } from "./feed.module";
import { KNEX_CONNECTION } from "../common/database/knex.provider";
import { REDIS_CLIENT } from "../common/cache/redis.provider";
import { STORAGE_SERVICE } from "../common/services/storage/storage.interface";
import { testStorageProvider } from "../test/helper/test-storage.module";

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
      imports: [FeedModule, TestDatabaseModule, TestCacheModule],
    })
      .overrideProvider(KNEX_CONNECTION)
      .useFactory({ factory: testKnexProvider.useFactory })
      .overrideProvider(REDIS_CLIENT)
      .useFactory({ factory: testRedisProvider.useFactory })
      .overrideProvider(STORAGE_SERVICE)
      .useFactory({ factory: testStorageProvider.useFactory })
      .compile();

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
      });
      await testDb.createDefinition({
        content: "feed content",
        wordId: word.id,
        userId: followedUser.id,
        isPublic: true,
      });

      const paginationDto: PaginationDto = { page: 1, limit: 10, offset: 0 };

      const result = await service.getFeed(testUser.id, paginationDto);

      expect(result.data.length).toBeGreaterThanOrEqual(1);
    });

    it("should include user's own content in feed", async () => {
      const word = await testDb.createWord({ term: "myword", userId: testUser.id });
      await testDb.createDefinition({
        content: "my content",
        wordId: word.id,
        userId: testUser.id,
        isPublic: true,
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
      });
      await testDb.createDefinition({
        content: "popular def",
        wordId: word.id,
        userId: otherUser.id,
        isPublic: true,
      });

      const paginationDto: PaginationDto = { page: 1, limit: 10, offset: 0 };

      const result = await service.getRecommendations(paginationDto);

      expect(result.data).toBeDefined();
    });

    it("should exclude specified user from recommendations", async () => {
      const word = await testDb.createWord({
        term: "myword",
        userId: testUser.id,
      });
      await testDb.createDefinition({
        content: "my def",
        wordId: word.id,
        userId: testUser.id,
        isPublic: true,
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
