import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { PaginationDto } from "@shared";
import {
  cleanupTestDatabase,
  getTestDatabaseHelper,
  TestDatabaseHelper,
} from "../test/helper/test-database.helper";
import { TestDatabaseModule } from "../test/helper/test-database.module";
import type { CreateWordDto } from "./dto/create-word.dto";
import type { UpdateWordDto } from "./dto/update-word.dto";
import { WordsRepository } from "./words.repository";
import { WordsService } from "./words.service";

describe("WordsService", () => {
  let service: WordsService;
  let testDb: TestDatabaseHelper;
  let testUser: { id: string; nickname: string };

  beforeAll(async () => {
    testDb = getTestDatabaseHelper();
    await testDb.setupSchema();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    await testDb.cleanAll();

    testUser = await testDb.createUser({ nickname: "testuser" });

    const module: TestingModule = await Test.createTestingModule({
      imports: [TestDatabaseModule],
      providers: [WordsService, WordsRepository],
    }).compile();

    service = module.get<WordsService>(WordsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a word", async () => {
      const dto: CreateWordDto = { term: "test" };

      const result = await service.create(testUser.id, dto);

      expect(result.term).toBe("test");
      expect(result.userId).toBe(testUser.id);
    });
  });

  describe("findAllByUser", () => {
    it("should return words for a user", async () => {
      await testDb.createWord({ term: "word1", userId: testUser.id });
      await testDb.createWord({ term: "word2", userId: testUser.id });

      const result = await service.findAllByUser(testUser.id);

      expect(result).toHaveLength(2);
    });

    it("should return empty array if user has no words", async () => {
      const result = await service.findAllByUser(testUser.id);
      expect(result).toHaveLength(0);
    });
  });

  describe("findOne", () => {
    it("should return a word if found and public definition exists", async () => {
      const word = await testDb.createWord({
        term: "public-word",
        userId: testUser.id,
      });
      // Mock hasPublicDefinitions or create a definition
      // Since we use real DB helper, we need to create a definition
      await testDb.createDefinition({
        content: "def",
        wordId: word.id,
        userId: testUser.id,
      });
      // But wait, the Service test uses real Repository?
      // It uses TestDatabaseModule which uses real DB?
      // Yes, `getTestDatabaseHelper` uses Knex.
      // But `WordsService` calls `wordRepository.hasPublicDefinitions`.
      // I need to add definition creation if I want `hasPublicDefinitions` to return true.
      // However, for this test "return a word if found", we are testing `findOne`.
      // If I am the owner (`testUser`), I should see it regardless of definitions.
      // So this test case "return a word if found and public" is redundant if I am owner.
      // The test creates word with `testUser.id`.

      const result = await service.findOne(word.id, testUser.id);

      expect(result.term).toBe("public-word");
    });

    it("should throw NotFoundException if word not found", async () => {
      await expect(service.findOne("00000000-0000-0000-0000-000000000000")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException if word has no public definitions and user is not owner", async () => {
      const owner = await testDb.createUser({ nickname: "owner" });
      const word = await testDb.createWord({
        term: "private-word",
        userId: owner.id,
      });

      await expect(service.findOne(word.id, testUser.id)).rejects.toThrow(ForbiddenException);
    });

    it("should allow owner to see private word", async () => {
      const word = await testDb.createWord({
        term: "my-private-word",
        userId: testUser.id,
      });

      const result = await service.findOne(word.id, testUser.id);

      expect(result.term).toBe("my-private-word");
    });
  });

  describe("update", () => {
    it("should update a word", async () => {
      const word = await testDb.createWord({
        term: "original",
        userId: testUser.id,
      });
      const dto: UpdateWordDto = { term: "updated" };

      const result = await service.update(word.id, dto);

      expect(result.term).toBe("updated");
    });

    it("should throw NotFoundException if word to update not found", async () => {
      await expect(
        service.update("00000000-0000-0000-0000-000000000000", { term: "test" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should remove a word", async () => {
      const word = await testDb.createWord({
        term: "to-delete",
        userId: testUser.id,
      });

      await service.remove(word.id, testUser.id);

      const words = await service.findAllByUser(testUser.id);
      expect(words).toHaveLength(0);
    });

    it("should throw ForbiddenException when non-owner tries to delete", async () => {
      const owner = await testDb.createUser({ nickname: "owner2" });
      const word = await testDb.createWord({ term: "not-mine", userId: owner.id });

      await expect(service.remove(word.id, testUser.id)).rejects.toThrow(ForbiddenException);
    });
  });

  describe("search", () => {
    it("should return empty results for empty term", async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10, offset: 0 };

      const result = await service.search("", paginationDto);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it("should search for public words", async () => {
      const word1 = await testDb.createWord({ term: "searchable", userId: testUser.id });
      await testDb.createDefinition({
        content: "def1",
        wordId: word1.id,
        userId: testUser.id,
        isPublic: true,
      });

      const word2 = await testDb.createWord({ term: "another-search", userId: testUser.id });
      await testDb.createDefinition({
        content: "def2",
        wordId: word2.id,
        userId: testUser.id,
        isPublic: true,
      });

      const paginationDto: PaginationDto = { page: 1, limit: 10, offset: 0 };

      const result = await service.search("search", paginationDto);

      expect(result.data.length).toBeGreaterThanOrEqual(1);
    });

    it("should include user's private words in search results when userId provided", async () => {
      await testDb.createWord({ term: "my-secret", userId: testUser.id });
      const paginationDto: PaginationDto = { page: 1, limit: 10, offset: 0 };

      const result = await service.search("secret", paginationDto, testUser.id);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].term).toBe("my-secret");
    });
  });
});
