import { getQueueToken } from "@nestjs/bullmq";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { DefinitionsRepository } from "../definitions/definitions.repository";
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
import { WordsRepository } from "../words/words.repository";
import { LikesRepository } from "./likes.repository";
import { LikesService } from "./likes.service";

describe("LikesService", () => {
  let service: LikesService;
  let module: TestingModule;
  let testDb: TestDatabaseHelper;
  let testUser: { id: string };
  let otherUser: { id: string };
  let testWord: { id: string };
  let testDefinition: { id: string; userId: string };

  const mockLikesQueue = {
    add: jest.fn(),
  };

  beforeAll(async () => {
    testDb = getTestDatabaseHelper();
    await testDb.setupSchema();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    await testDb.cleanAll();

    testUser = await testDb.createUser({ nickname: "liker" });
    otherUser = await testDb.createUser({ nickname: "defowner" });
    testWord = await testDb.createWord({ term: "likeword", userId: otherUser.id });
    testDefinition = await testDb.createDefinition({
      content: "likeable def",
      wordId: testWord.id,
      userId: otherUser.id,
    });

    module = await Test.createTestingModule({
      imports: [TestDatabaseModule, TestCacheModule],
      providers: [
        LikesService,
        LikesRepository,
        DefinitionsRepository,
        UsersRepository,
        WordsRepository,
        NotificationsService,
        NotificationsRepository,
        {
          provide: getQueueToken("likes"),
          useValue: mockLikesQueue,
        },
      ],
    }).compile();

    service = module.get<LikesService>(LikesService);

    jest.spyOn(service, "toggle").mockImplementation(async (userId, definitionId) => {
      await service.executeToggle(userId, definitionId);
    });
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("toggle", () => {
    it("should create a like if none exists", async () => {
      await service.toggle(testUser.id, testDefinition.id);
      const result = await service.checkUserLike(testUser.id, testDefinition.id);

      expect(result).toBe(true);
    });

    it("should delete a like if it exists", async () => {
      await service.toggle(testUser.id, testDefinition.id);
      await service.toggle(testUser.id, testDefinition.id);

      const result = await service.checkUserLike(testUser.id, testDefinition.id);

      expect(result).toBe(false);
    });

    it("should throw ForbiddenException if liking own definition", async () => {
      await expect(service.toggle(otherUser.id, testDefinition.id)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should throw NotFoundException if definition not found", async () => {
      await expect(
        service.toggle(testUser.id, "00000000-0000-0000-0000-000000000000"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("checkUserLike", () => {
    it("should return true if user liked the definition", async () => {
      await service.toggle(testUser.id, testDefinition.id);

      const result = await service.checkUserLike(testUser.id, testDefinition.id);

      expect(result).toBe(true);
    });

    it("should return false if user has not liked the definition", async () => {
      const result = await service.checkUserLike(testUser.id, testDefinition.id);

      expect(result).toBe(false);
    });
  });

  describe("getLikesByDefinition", () => {
    it("should return all likes for a definition", async () => {
      const thirdUser = await testDb.createUser({ nickname: "thirdliker" });
      await service.toggle(testUser.id, testDefinition.id);
      await service.toggle(thirdUser.id, testDefinition.id);

      const result = await service.getLikesByDefinition(testDefinition.id);

      expect(result).toHaveLength(2);
    });

    it("should return empty array if no likes", async () => {
      const result = await service.getLikesByDefinition(testDefinition.id);

      expect(result).toHaveLength(0);
    });
  });
});
