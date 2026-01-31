import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { NotificationsRepository } from "../notifications/notifications.repository";
import { NotificationsService } from "../notifications/notifications.service";
import { TestCacheModule } from "../test/helper/test-cache.module";
import {
  cleanupTestDatabase,
  getTestDatabaseHelper,
  TestDatabaseHelper,
} from "../test/helper/test-database.helper";
import { TestDatabaseModule } from "../test/helper/test-database.module";
import { UsersRepository } from "../users/users.repository";
import { FollowsRepository } from "./follows.repository";
import { FollowsService } from "./follows.service";

describe("FollowsService", () => {
  let service: FollowsService;
  let testDb: TestDatabaseHelper;
  let testUser: { id: string };
  let otherUser: { id: string };
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

    testUser = await testDb.createUser({ nickname: "follower" });
    otherUser = await testDb.createUser({ nickname: "following" });

    module = await Test.createTestingModule({
      imports: [TestDatabaseModule, TestCacheModule],
      providers: [
        FollowsService,
        FollowsRepository,
        UsersRepository,
        NotificationsService,
        NotificationsRepository,
      ],
    }).compile();

    service = module.get<FollowsService>(FollowsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("follow", () => {
    it("should follow a user", async () => {
      const result = await service.follow(testUser.id, otherUser.id);

      expect(result.followerId).toBe(testUser.id);
      expect(result.followingId).toBe(otherUser.id);
    });

    it("should throw BadRequestException for self-follow", async () => {
      await expect(service.follow(testUser.id, testUser.id)).rejects.toThrow(BadRequestException);
    });

    it("should throw NotFoundException if user to follow not found", async () => {
      await expect(
        service.follow(testUser.id, "00000000-0000-0000-0000-000000000000"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if already following", async () => {
      await service.follow(testUser.id, otherUser.id);

      await expect(service.follow(testUser.id, otherUser.id)).rejects.toThrow(BadRequestException);
    });
  });

  describe("unfollow", () => {
    it("should unfollow a user", async () => {
      await service.follow(testUser.id, otherUser.id);

      await service.unfollow(testUser.id, otherUser.id);

      const isFollowing = await service.checkFollowing(testUser.id, otherUser.id);
      expect(isFollowing).toBe(false);
    });

    it("should throw NotFoundException if follow relationship not found", async () => {
      await expect(service.unfollow(testUser.id, otherUser.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe("checkFollowing", () => {
    it("should return true if following", async () => {
      await service.follow(testUser.id, otherUser.id);

      const result = await service.checkFollowing(testUser.id, otherUser.id);

      expect(result).toBe(true);
    });

    it("should return false if not following", async () => {
      const result = await service.checkFollowing(testUser.id, otherUser.id);

      expect(result).toBe(false);
    });
  });

  describe("getFollowStats", () => {
    it("should return follower and following counts", async () => {
      const thirdUser = await testDb.createUser({ nickname: "third" });
      await service.follow(testUser.id, otherUser.id);
      await service.follow(thirdUser.id, otherUser.id);

      const result = await service.getFollowStats(otherUser.id);

      expect(result.followersCount).toBe(2);
    });
  });

  describe("getFollowingIds", () => {
    it("should return list of following user IDs", async () => {
      const thirdUser = await testDb.createUser({ nickname: "third" });
      await service.follow(testUser.id, otherUser.id);
      await service.follow(testUser.id, thirdUser.id);

      const result = await service.getFollowingIds(testUser.id);

      expect(result).toHaveLength(2);
      expect(result).toContain(otherUser.id);
      expect(result).toContain(thirdUser.id);
    });
  });

  describe("getFollowerIds", () => {
    it("should return list of follower user IDs", async () => {
      const thirdUser = await testDb.createUser({ nickname: "third" });
      await service.follow(testUser.id, otherUser.id);
      await service.follow(thirdUser.id, otherUser.id);

      const result = await service.getFollowerIds(otherUser.id);

      expect(result).toHaveLength(2);
      expect(result).toContain(testUser.id);
      expect(result).toContain(thirdUser.id);
    });
  });
});
