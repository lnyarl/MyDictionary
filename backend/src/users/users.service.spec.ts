import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { DefinitionsRepository } from "../definitions/definitions.repository";
import { FollowsRepository } from "../follows/follows.repository";
import { FollowsService } from "../follows/follows.service";
import { NotificationsRepository } from "../notifications/notifications.repository";
import { NotificationsService } from "../notifications/notifications.service";
import { TestCacheModule } from "../test/helper/test-cache.module";
import {
  cleanupTestDatabase,
  getTestDatabaseHelper,
  TestDatabaseHelper,
} from "../test/helper/test-database.helper";
import { TestDatabaseModule } from "../test/helper/test-database.module";
import { WordsRepository } from "../words/words.repository";
import { UsersRepository } from "./users.repository";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  let service: UsersService;
  let testDb: TestDatabaseHelper;
  let testUser: { id: string; nickname: string; email: string };
  let module: TestingModule;

  beforeAll(async () => {
    testDb = getTestDatabaseHelper();
    await testDb.setupSchema();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    await testDb.cleanAll();

    testUser = await testDb.createUser({
      nickname: "testuser",
      email: "test@example.com",
      googleId: "google-123",
    });

    module = await Test.createTestingModule({
      imports: [TestDatabaseModule, TestCacheModule],
      providers: [
        UsersService,
        UsersRepository,
        WordsRepository,
        DefinitionsRepository,
        FollowsService,
        FollowsRepository,
        NotificationsService,
        NotificationsRepository,
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findByGoogleId", () => {
    it("should return a user by google id", async () => {
      const result = await service.findByGoogleId("google-123");

      expect(result).not.toBeNull();
      expect(result?.email).toBe("test@example.com");
    });

    it("should return undefined for non-existent google id", async () => {
      const result = await service.findByGoogleId("non-existent");

      expect(result).toBeUndefined();
    });
  });

  describe("findById", () => {
    it("should return a user by id", async () => {
      const result = await service.findById(testUser.id);

      expect(result).not.toBeNull();
      expect(result?.nickname).toBe("testuser");
    });

    it("should return undefined for non-existent id", async () => {
      const result = await service.findById("00000000-0000-0000-0000-000000000000");

      expect(result).toBeUndefined();
    });
  });

  describe("findByEmail", () => {
    it("should return a user by email", async () => {
      const result = await service.findByEmail("test@example.com");

      expect(result).not.toBeNull();
      expect(result?.nickname).toBe("testuser");
    });
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const result = await service.create({
        googleId: "new-google-id",
        email: "newuser@example.com",
        nickname: "newuser",
        profilePicture: "https://example.com/pic.jpg",
      });

      expect(result.email).toBe("newuser@example.com");
      expect(result.nickname).toBe("newuser");
    });
  });

  describe("updateNickname", () => {
    it("should update nickname if available", async () => {
      const result = await service.updateNickname(testUser.id, "newnickname");

      expect(result.nickname).toBe("newnickname");
    });

    it("should throw ConflictException if nickname taken by another user", async () => {
      await testDb.createUser({ nickname: "taken", email: "other@test.com" });

      await expect(service.updateNickname(testUser.id, "taken")).rejects.toThrow(ConflictException);
    });

    it("should allow user to keep same nickname", async () => {
      const result = await service.updateNickname(testUser.id, "testuser");

      expect(result.nickname).toBe("testuser");
    });

    it("should throw NotFoundException if user not found", async () => {
      await expect(
        service.updateNickname("00000000-0000-0000-0000-000000000000", "new"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("updateProfile", () => {
    it("should update profile fields", async () => {
      const result = await service.updateProfile(testUser.id, {
        nickname: "updated",
        bio: "My bio",
      });

      expect(result.nickname).toBe("updated");
      expect(result.bio).toBe("My bio");
    });

    it("should throw ConflictException if nickname is taken", async () => {
      await testDb.createUser({ nickname: "existing", email: "existing@test.com" });

      await expect(service.updateProfile(testUser.id, { nickname: "existing" })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("getUserProfile", () => {
    it("should return user profile with stats", async () => {
      const w1 = await testDb.createWord({ term: "word1", userId: testUser.id });
      await testDb.createDefinition({
        content: "def1",
        wordId: w1.id,
        userId: testUser.id,
        isPublic: true,
      });

      const w2 = await testDb.createWord({ term: "word2", userId: testUser.id });
      await testDb.createDefinition({
        content: "def2",
        wordId: w2.id,
        userId: testUser.id,
        isPublic: true,
      });

      const otherUser = await testDb.createUser({ nickname: "follower" });
      await testDb.createFollow({ followerId: otherUser.id, followingId: testUser.id });

      const result = await service.getUserProfile(testUser.id);

      expect(result.user.id).toBe(testUser.id);
      expect(result.user.nickname).toBe("testuser");
      expect(Number((result.stats.wordsCount as any)?.count || result.stats.wordsCount)).toBe(2);
      expect(Number(result.stats.followersCount)).toBe(1);
    });

    it("should throw NotFoundException if user not found", async () => {
      await expect(service.getUserProfile("00000000-0000-0000-0000-000000000000")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("getUserPublicWords", () => {
    it("should return paginated public words", async () => {
      const w1 = await testDb.createWord({ term: "public1", userId: testUser.id });
      await testDb.createDefinition({
        content: "def1",
        wordId: w1.id,
        userId: testUser.id,
        isPublic: true,
      });

      const w2 = await testDb.createWord({ term: "public2", userId: testUser.id });
      await testDb.createDefinition({
        content: "def2",
        wordId: w2.id,
        userId: testUser.id,
        isPublic: true,
      });

      const w3 = await testDb.createWord({ term: "private1", userId: testUser.id });
      await testDb.createDefinition({
        content: "def3",
        wordId: w3.id,
        userId: testUser.id,
        isPublic: false,
      });

      const result = await service.getUserPublicWords(testUser.id, {
        page: 1,
        limit: 10,
        offset: 0,
      });

      expect(result.data).toHaveLength(2);
    });
  });
});
