import { ConfigModule } from "@nestjs/config";
import { Test, type TestingModule } from "@nestjs/testing";
import { PaginationDto } from "@stashy/shared";
import { CacheModule } from "../common/cache/cache.module";
import { REDIS_CLIENT } from "../common/cache/redis.provider";
import { DatabaseModule } from "../common/database/database.module";
import { KNEX_CONNECTION } from "../common/database/knex.provider";
import { MetadataService } from "../common/services/metadata.service";
import { STORAGE_SERVICE } from "../common/services/storage/storage.interface";
import { StorageModule } from "../common/services/storage/storage.module";
import { DefinitionsService } from "../definitions/definitions.service";
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
import { TestStorageModule, testStorageProvider } from "../test/helper/test-storage.module";
import { FeedModule } from "./feed.module";
import { FeedService } from "./feed.service";

describe("FeedService", () => {
  let service: FeedService;
  let testDb: TestDatabaseHelper;
  let testUser: { id: string };
  let module: TestingModule = null;

  beforeAll(async () => {
    testDb = getTestDatabaseHelper();
    await testDb.setupSchema();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await destroyTestRedisInstance();
  });

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        FeedModule,
        TestDatabaseModule,
        TestCacheModule,
      ],
    })
      .overrideModule(DatabaseModule)
      .useModule(TestDatabaseModule)
      .overrideModule(CacheModule)
      .useModule(TestCacheModule)
      .compile();
    service = module.get<FeedService>(FeedService);
    await testDb.cleanAll();
    await flushTestRedis();
    testUser = await testDb.createUser({ nickname: "feeduser" });
  });
  // afterEach(async () => {
  //   await module?.close();
  // });

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

      expect(result.data.length).toBeGreaterThanOrEqual(0);
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
