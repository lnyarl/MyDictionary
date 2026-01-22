import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import {
  cleanupTestDatabase,
  getTestDatabaseHelper,
  TestDatabaseHelper,
} from "../common/database/test-database.helper";
import { TestDatabaseModule } from "../common/database/test-database.module";
import { DefinitionsRepository } from "../definitions/definitions.repository";
import { LikesRepository } from "./likes.repository";
import { LikesService } from "./likes.service";

describe("LikesService", () => {
  let service: LikesService;
  let testDb: TestDatabaseHelper;
  let testUser: { id: string };
  let otherUser: { id: string };
  let testWord: { id: string };
  let testDefinition: { id: string; userId: string };

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
    testWord = await testDb.createWord({ term: "likeword", userId: otherUser.id, isPublic: true });
    testDefinition = await testDb.createDefinition({
      content: "likeable def",
      wordId: testWord.id,
      userId: otherUser.id,
    });

    const module: TestingModule = await Test.createTestingModule({
      imports: [TestDatabaseModule],
      providers: [LikesService, LikesRepository, DefinitionsRepository],
    }).compile();

    service = module.get<LikesService>(LikesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("toggle", () => {
    it("should create a like if none exists", async () => {
      const result = await service.toggle(testUser.id, testDefinition.id);

      expect(result).toBe(true);
    });

    it("should delete a like if it exists", async () => {
      await service.toggle(testUser.id, testDefinition.id);

      const result = await service.toggle(testUser.id, testDefinition.id);

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
