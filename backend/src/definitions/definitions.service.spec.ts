import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { MetadataService } from "../common/services/metadata.service";
import { DefinitionHistoriesRepository } from "../definition-histories/definition-histories.repository";
import { FeedRepository } from "../feed/feed.repository";
import { FeedService } from "../feed/feed.service";
import { FollowsRepository } from "../follows/follows.repository";
import { FollowsService } from "../follows/follows.service";
import { NotificationsRepository } from "../notifications/notifications.repository";
import { NotificationsService } from "../notifications/notifications.service";
import { destroyTestRedisInstance, TestCacheModule } from "../test/helper/test-cache.module";
import {
  cleanupTestDatabase,
  getTestDatabaseHelper,
  TestDatabaseHelper,
} from "../test/helper/test-database.helper";
import { TestDatabaseModule } from "../test/helper/test-database.module";
import { UsersRepository } from "../users/users.repository";
import { WordsRepository } from "../words/words.repository";
import { DefinitionsRepository } from "./definitions.repository";
import { DefinitionsService } from "./definitions.service";
import { CreateDefinitionDto } from "./dto/create-definition.dto";

describe("DefinitionsService", () => {
  let service: DefinitionsService;
  let testDb: TestDatabaseHelper;
  let testUser: { id: string };
  let testWord: { id: string };

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

    testUser = await testDb.createUser({ nickname: "defuser" });
    testWord = await testDb.createWord({ term: "testword", userId: testUser.id });

    const module: TestingModule = await Test.createTestingModule({
      imports: [TestDatabaseModule, TestCacheModule],
      providers: [
        DefinitionsService,
        DefinitionHistoriesRepository,
        DefinitionsRepository,
        WordsRepository,
        FeedService,
        FeedRepository,
        FollowsService,
        FollowsRepository,
        UsersRepository,
        NotificationsService,
        NotificationsRepository,
        {
          provide: MetadataService,
          useValue: {
            extractMetadata: jest.fn().mockResolvedValue({
              url: "http://test.com",
              type: "website",
            }),
          },
        },
      ],
    }).compile();

    service = module.get<DefinitionsService>(DefinitionsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a definition", async () => {
      const dto: CreateDefinitionDto = { wordId: testWord.id, content: "test definition" };

      const result = await service.create(testUser.id, dto);

      expect(result.content).toBe("test definition");
      expect(result.wordId).toBe(testWord.id);
      expect(result.userId).toBe(testUser.id);
    });

    it("should throw NotFoundException if word not found", async () => {
      const dto: CreateDefinitionDto = {
        wordId: "00000000-0000-0000-0000-000000000000",
        content: "test",
      };

      await expect(service.create(testUser.id, dto)).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if word is private and user is not owner", async () => {
      const owner = await testDb.createUser({ nickname: "owner" });
      const privateWord = await testDb.createWord({
        term: "private",
        userId: owner.id,
      });
      const dto: CreateDefinitionDto = { wordId: privateWord.id, content: "test" };

      await expect(service.create(testUser.id, dto)).rejects.toThrow(ForbiddenException);
    });

    it("should allow owner to create definition for private word", async () => {
      const privateWord = await testDb.createWord({
        term: "myprivate",
        userId: testUser.id,
      });
      const dto: CreateDefinitionDto = { wordId: privateWord.id, content: "my definition" };

      const result = await service.create(testUser.id, dto);

      expect(result.content).toBe("my definition");
    });
  });

  describe("findAllByWord", () => {
    it("should return definitions for a public word", async () => {
      await testDb.createDefinition({
        content: "def1",
        wordId: testWord.id,
        userId: testUser.id,
        isPublic: true,
      });
      await testDb.createDefinition({
        content: "def2",
        wordId: testWord.id,
        userId: testUser.id,
        isPublic: true,
      });

      const result = await service.findAllByWord(testWord.id);

      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it("should throw NotFoundException if word not found", async () => {
      await expect(service.findAllByWord("00000000-0000-0000-0000-000000000000")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException for private word if not owner", async () => {
      const owner = await testDb.createUser({ nickname: "wordowner" });
      const privateWord = await testDb.createWord({
        term: "secret",
        userId: owner.id,
      });

      await expect(service.findAllByWord(privateWord.id, testUser.id)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("remove", () => {
    it("should remove definition", async () => {
      const definition = await testDb.createDefinition({
        content: "to delete",
        wordId: testWord.id,
        userId: testUser.id,
      });

      await service.remove(definition.id, testUser.id);

      await expect(service.findOne(definition.id, testUser.id)).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if not owner", async () => {
      const otherUser = await testDb.createUser({ nickname: "other" });
      const definition = await testDb.createDefinition({
        content: "not mine",
        wordId: testWord.id,
        userId: otherUser.id,
      });

      await expect(service.remove(definition.id, testUser.id)).rejects.toThrow(ForbiddenException);
    });

    it("should throw NotFoundException if definition not found", async () => {
      await expect(
        service.remove("00000000-0000-0000-0000-000000000000", testUser.id),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
