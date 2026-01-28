import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { PaginationDto } from "@stashy/shared";
import { CreateWordDto } from "@stashy/shared/dto/word/create-word.dto";
import { UpdateWordDto } from "@stashy/shared/dto/word/update-word.dto";
import { DefinitionsService } from "../definitions/definitions.service";
import {
  cleanupTestDatabase,
  getTestDatabaseHelper,
  TestDatabaseHelper,
} from "../test/helper/test-database.helper";
import { TestDatabaseModule } from "../test/helper/test-database.module";
import { WordsRepository } from "./words.repository";
import { WordsService } from "./words.service";

describe("WordsService", () => {
  let service: WordsService;
  let testDb: TestDatabaseHelper;
  let testUser: { id: string; nickname: string };
  let testingModule: TestingModule;

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

    testingModule = await Test.createTestingModule({
      imports: [TestDatabaseModule],
      providers: [
        WordsService,
        WordsRepository,
        {
          provide: DefinitionsService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = testingModule.get<WordsService>(WordsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a word with definitions", async () => {
      const dto: CreateWordDto = {
        term: "test-with-def",
        definition: {
          content: "def1",
          tags: ["tag1"],
          isPublic: true,
        },
      };

      // Mock definitionsService.create
      const definitionsService = testingModule.get(DefinitionsService);
      (definitionsService.create as jest.Mock).mockResolvedValue({} as any);

      const result = await service.create(testUser.id, dto);

      expect(result.term).toBe("test-with-def");
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
      await testDb.createDefinition({
        content: "def",
        wordId: word.id,
        userId: testUser.id,
      });

      const result = await service.findOne(word.id);

      expect(result.term).toBe("public-word");
    });

    it("should throw NotFoundException if word not found", async () => {
      await expect(service.findOne("00000000-0000-0000-0000-000000000000")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should allow owner to see private word", async () => {
      const word = await testDb.createWord({
        term: "my-private-word",
        userId: testUser.id,
      });

      const result = await service.findOne(word.id);

      expect(result.term).toBe("my-private-word");
    });
  });

  describe("search", () => {
    it("should return empty results for empty term", async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10, offset: 0 };

      const result = await service.search("", paginationDto);

      expect(result.data).toEqual([]);
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
