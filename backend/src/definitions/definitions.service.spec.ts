import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Definition, PaginatedResponseDto } from "@stashy/shared";
import { CreateDefinitionDto } from "@stashy/shared/dto/definition/create-definition.dto";
import { UpdateDefinitionDto } from "@stashy/shared/dto/definition/update-definition.dto";
import { EventEmitterService } from "../common/events/event-emitter.service";
import { MetadataService } from "../common/services/metadata.service";
import { STORAGE_SERVICE } from "../common/services/storage/storage.interface";
import { DefinitionHistoriesRepository } from "../definition-histories/definition-histories.repository";
import { DefinitionHistory } from "../definition-histories/entities/definition-history.entity";
import { FeedService } from "../feed/feed.service";
import { Word } from "../words/entities/word.entity";
import { WordsRepository } from "../words/words.repository";
import { DefinitionsRepository } from "./definitions.repository";
import { DefinitionsService } from "./definitions.service";

describe("DefinitionsService", () => {
  let service: DefinitionsService;
  let definitionRepository: jest.Mocked<DefinitionsRepository>;
  let definitionHistoriesRepository: jest.Mocked<DefinitionHistoriesRepository>;
  let feedService: jest.Mocked<FeedService>;
  let metadataService: jest.Mocked<MetadataService>;
  let wordRepository: jest.Mocked<WordsRepository>;
  let storageService: jest.Mocked<any>;
  let eventEmitter: jest.Mocked<EventEmitterService>;

  const mockWord: Word = {
    id: "word-1",
    term: "testword",
    userId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockDefinition: Definition = {
    id: "def-1",
    content: "test definition",
    wordId: "word-1",
    termId: "term-1",
    userId: "user-1",
    isPublic: true,
    tags: [],
    mediaUrls: [],
    likesCount: 0,
    isLiked: false,
    term: "testword",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockDefinitionRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByIdWithPublic: jest.fn(),
      findAllByWordId: jest.fn(),
      delete: jest.fn(),
      updateDefinition: jest.fn(),
      findByUserId: jest.fn(),
      getTermIdByTerm: jest.fn(),
      findByTerm: jest.fn(),
    };

    const mockDefinitionHistoriesRepo = {
      create: jest.fn(),
      findByDefinitionId: jest.fn(),
    };

    const mockFeedService = {
      invalidateFollowerFeeds: jest.fn().mockResolvedValue(undefined),
      invalidateRecommendations: jest.fn().mockResolvedValue(undefined),
      invalidateMyFeed: jest.fn().mockResolvedValue(undefined),
    };

    const mockMetadataService = {
      extractMetadata: jest.fn(),
    };

    const mockWordRepo = {
      findById: jest.fn(),
    };

    const mockStorageService = {
      moveFileToPermanent: jest.fn(),
    };

    const mockEventEmitter = {
      emitDefinitionCreate: jest.fn().mockResolvedValue(undefined),
      emitDefinitionUpdate: jest.fn().mockResolvedValue(undefined),
      emitDefinitionDelete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DefinitionsService,
        {
          provide: DefinitionsRepository,
          useValue: mockDefinitionRepo,
        },
        {
          provide: DefinitionHistoriesRepository,
          useValue: mockDefinitionHistoriesRepo,
        },
        {
          provide: FeedService,
          useValue: mockFeedService,
        },
        {
          provide: MetadataService,
          useValue: mockMetadataService,
        },
        {
          provide: WordsRepository,
          useValue: mockWordRepo,
        },
        {
          provide: STORAGE_SERVICE,
          useValue: mockStorageService,
        },
        {
          provide: EventEmitterService,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<DefinitionsService>(DefinitionsService);
    definitionRepository = module.get(DefinitionsRepository);
    definitionHistoriesRepository = module.get(DefinitionHistoriesRepository);
    feedService = module.get(FeedService);
    metadataService = module.get(MetadataService);
    wordRepository = module.get(WordsRepository);
    storageService = module.get(STORAGE_SERVICE);
    eventEmitter = module.get(EventEmitterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    const createDto: CreateDefinitionDto = {
      wordId: "word-1",
      content: "test definition",
      isPublic: true,
      tags: [],
    };

    it("should create a definition", async () => {
      definitionRepository.getTermIdByTerm.mockReturnValue({
        maybeTransacting: jest.fn().mockResolvedValue([{ id: "term-1" }]),
      } as any);
      definitionRepository.create.mockReturnValue({
        maybeTransacting: jest.fn().mockResolvedValue([mockDefinition]),
      } as any);

      const result = await service.create("user-1", mockWord, createDto);

      expect(result.content).toBe("test definition");
      expect(definitionRepository.create).toHaveBeenCalled();
      expect(eventEmitter.emitDefinitionCreate).toHaveBeenCalledWith(
        "user-1",
        mockDefinition.id,
        mockWord.id,
      );
      expect(feedService.invalidateFollowerFeeds).toHaveBeenCalledWith("user-1");
    });

    it("should throw ForbiddenException if word is private and user is not owner", async () => {
      const privateWord = { ...mockWord, userId: "other-user" };

      await expect(service.create("user-1", privateWord, createDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should allow owner to create definition for private word", async () => {
      definitionRepository.getTermIdByTerm.mockReturnValue({
        maybeTransacting: jest.fn().mockResolvedValue([{ id: "term-1" }]),
      } as any);
      definitionRepository.create.mockReturnValue({
        maybeTransacting: jest.fn().mockResolvedValue([mockDefinition]),
      } as any);

      const result = await service.create("user-1", mockWord, createDto);

      expect(result.content).toBe("test definition");
    });

    it("should throw InternalServerErrorException if term not found", async () => {
      definitionRepository.getTermIdByTerm.mockReturnValue({
        maybeTransacting: jest.fn().mockResolvedValue([]),
      } as any);

      await expect(service.create("user-1", mockWord, createDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe("findWordById", () => {
    it("should return a word if found", async () => {
      wordRepository.findById.mockResolvedValue(mockWord);

      const result = await service.findWordById("word-1");

      expect(result).toEqual(mockWord);
    });

    it("should throw NotFoundException if word not found", async () => {
      wordRepository.findById.mockResolvedValue(null);

      await expect(service.findWordById("non-existent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("findAllByWord", () => {
    it("should return definitions for a public word", async () => {
      const mockResults = [
        {
          id: "def-1",
          content: "def1",
          wordid: "word-1",
          userid: "user-1",
          tags: [],
          mediaUrls: [],
          likesCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "def-2",
          content: "def2",
          wordid: "word-1",
          userid: "user-1",
          tags: [],
          mediaUrls: [],
          likesCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      definitionRepository.findAllByWordId.mockResolvedValue(mockResults as any);

      const result = await service.findAllByWord(mockWord);

      expect(result).toHaveLength(2);
    });

    it("should throw ForbiddenException for private word if not owner", async () => {
      const privateWord = { ...mockWord, userId: "other-user" };

      await expect(service.findAllByWord(privateWord, "user-1")).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("findOne", () => {
    it("should return definition if found and public", async () => {
      definitionRepository.findByIdWithPublic.mockResolvedValue(mockDefinition as any);

      const result = await service.findOne("def-1");

      expect(result).toEqual(mockDefinition);
    });

    it("should throw NotFoundException if definition not found", async () => {
      definitionRepository.findByIdWithPublic.mockResolvedValue(null);

      await expect(service.findOne("non-existent")).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException for private definition without access", async () => {
      definitionRepository.findByIdWithPublic.mockResolvedValue({
        ...mockDefinition,
        isPublic: false,
        wordUserId: "other-user",
      } as any);

      await expect(service.findOne("def-1", "another-user")).rejects.toThrow(ForbiddenException);
    });
  });

  describe("update", () => {
    const updateDto: UpdateDefinitionDto = {
      content: "updated definition",
      tags: ["updated"],
      isPublic: true,
    };

    it("should update definition", async () => {
      definitionRepository.findById.mockResolvedValue(mockDefinition as any);
      definitionHistoriesRepository.create.mockResolvedValue(undefined as any);
      definitionRepository.updateDefinition.mockResolvedValue([
        { ...mockDefinition, ...updateDto },
      ] as any);

      const result = await service.update("def-1", "user-1", updateDto);

      expect(result.content).toBe("updated definition");
      expect(definitionHistoriesRepository.create).toHaveBeenCalled();
      expect(eventEmitter.emitDefinitionUpdate).toHaveBeenCalledWith(
        "user-1",
        "def-1",
        mockDefinition.wordId,
      );
    });

    it("should throw NotFoundException if definition not found", async () => {
      definitionRepository.findById.mockResolvedValue(null);

      await expect(service.update("non-existent", "user-1", updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException if not owner", async () => {
      definitionRepository.findById.mockResolvedValue({
        ...mockDefinition,
        userId: "other-user",
      } as any);

      await expect(service.update("def-1", "user-1", updateDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("remove", () => {
    it("should remove definition", async () => {
      definitionRepository.findById.mockResolvedValue(mockDefinition as any);
      definitionRepository.delete.mockResolvedValue(undefined);

      await service.remove("def-1", "user-1");

      expect(definitionRepository.delete).toHaveBeenCalledWith("def-1");
      expect(eventEmitter.emitDefinitionDelete).toHaveBeenCalledWith(
        "user-1",
        "def-1",
        mockDefinition.wordId,
      );
    });

    it("should throw ForbiddenException if not owner", async () => {
      definitionRepository.findById.mockResolvedValue({
        ...mockDefinition,
        userId: "other-user",
      } as any);

      await expect(service.remove("def-1", "user-1")).rejects.toThrow(ForbiddenException);
    });

    it("should throw NotFoundException if definition not found", async () => {
      definitionRepository.findById.mockResolvedValue(null);

      await expect(service.remove("non-existent", "user-1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("getDefinitionHistory", () => {
    it("should return definition history", async () => {
      const mockHistory: DefinitionHistory[] = [
        {
          id: "hist-1",
          definitionId: "def-1",
          content: "old content",
          tags: [],
          mediaUrls: [],
          createdAt: new Date(),
        },
      ];
      definitionRepository.findByIdWithPublic.mockResolvedValue(mockDefinition as any);
      definitionHistoriesRepository.findByDefinitionId.mockResolvedValue(mockHistory);

      const result = await service.getDefinitionHistory("def-1");

      expect(result).toHaveLength(1);
      expect(result[0].content).toBe("old content");
    });

    it("should throw NotFoundException if definition not found", async () => {
      definitionRepository.findByIdWithPublic.mockResolvedValue(null);

      await expect(service.getDefinitionHistory("non-existent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("getDefinitionsByTerm", () => {
    it("should return definitions by term", async () => {
      const definitions = [mockDefinition];
      definitionRepository.findByTerm.mockResolvedValue(definitions as any);

      const result = await service.getDefinitionsByTerm("testword");

      expect(result).toEqual(definitions);
      expect(definitionRepository.findByTerm).toHaveBeenCalledWith("testword", undefined);
    });
  });

  describe("getUserPublicDefinitions", () => {
    it("should return paginated definitions", async () => {
      const definitions = [mockDefinition, { ...mockDefinition, id: "def-2" }];
      definitionRepository.findByUserId.mockResolvedValue(definitions as any);

      const result = await service.getUserPublicDefinitions("user-1", {
        page: 1,
        limit: 10,
        offset: 0,
      });

      expect(result.data).toHaveLength(2);
      expect(result).toBeInstanceOf(PaginatedResponseDto);
    });

    it("should handle empty results", async () => {
      definitionRepository.findByUserId.mockResolvedValue([]);

      const result = await service.getUserPublicDefinitions("user-1", {
        page: 1,
        limit: 10,
        offset: 0,
      });

      expect(result.data).toHaveLength(0);
    });
  });
});
