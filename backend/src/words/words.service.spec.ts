import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PaginatedResponseDto } from "@stashy/shared";
import { CreateWordDto } from "@stashy/shared/dto/word/create-word.dto";
import { EventEmitterService } from "../common/events/event-emitter.service";
import { Word } from "./entities/word.entity";
import { WordsRepository } from "./words.repository";
import { WordsService } from "./words.service";

describe("WordsService", () => {
  let service: WordsService;
  let wordRepository: jest.Mocked<WordsRepository>;
  let eventEmitter: jest.Mocked<EventEmitterService>;

  const mockWord: Word = {
    id: "word-1",
    term: "testword",
    userId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockWordRepo = {
      findByTerm: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findMyWordsForAutocomplete: jest.fn(),
      findOthersWordsForAutocomplete: jest.fn(),
      searchWithDefinitions: jest.fn(),
    };

    const mockEventEmitter = {
      emitWordCreate: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WordsService,
        {
          provide: WordsRepository,
          useValue: mockWordRepo,
        },
        {
          provide: EventEmitterService,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<WordsService>(WordsService);
    wordRepository = module.get(WordsRepository);
    eventEmitter = module.get(EventEmitterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new word", async () => {
      const dto: CreateWordDto = {
        term: "newword",
        definition: {
          content: "definition",
          tags: ["tag1"],
          isPublic: true,
        },
      };
      wordRepository.findByTerm.mockResolvedValue(null);
      wordRepository.create.mockResolvedValue([mockWord] as any);
      wordRepository.findById.mockResolvedValue(mockWord);

      const result = await service.create("user-1", dto);

      expect(result.term).toBe("testword");
      expect(wordRepository.create).toHaveBeenCalledWith({
        term: "newword",
        userId: "user-1",
      });
      expect(eventEmitter.emitWordCreate).toHaveBeenCalledWith("user-1", "word-1", "testword");
    });

    it("should return existing word if term already exists for user", async () => {
      const dto: CreateWordDto = {
        term: "existingword",
        definition: {
          content: "definition",
          tags: ["tag1"],
          isPublic: true,
        },
      };
      wordRepository.findByTerm.mockResolvedValue(mockWord);
      wordRepository.findById.mockResolvedValue(mockWord);

      const result = await service.create("user-1", dto);

      expect(wordRepository.create).not.toHaveBeenCalled();
      expect(result.term).toBe("testword");
    });
  });

  describe("findAllByUser", () => {
    it("should return words for a user", async () => {
      const mockWords = [mockWord, { ...mockWord, id: "word-2", term: "word2" }];
      wordRepository.findByUserId.mockResolvedValue(mockWords);

      const result = await service.findAllByUser("user-1");

      expect(result).toHaveLength(2);
      expect(wordRepository.findByUserId).toHaveBeenCalledWith("user-1");
    });

    it("should return empty array if user has no words", async () => {
      wordRepository.findByUserId.mockResolvedValue([]);

      const result = await service.findAllByUser("user-1");

      expect(result).toHaveLength(0);
    });
  });

  describe("findOne", () => {
    it("should return a word if found", async () => {
      wordRepository.findById.mockResolvedValue(mockWord);

      const result = await service.findOne("word-1");

      expect(result.term).toBe("testword");
    });

    it("should throw NotFoundException if word not found", async () => {
      wordRepository.findById.mockResolvedValue(null);

      await expect(service.findOne("non-existent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("autocomplete", () => {
    it("should return empty results for empty term", async () => {
      const result = await service.autocomplete("");

      expect(result.myWords).toEqual([]);
      expect(result.othersWords).toEqual([]);
    });

    it("should return others words when no userId", async () => {
      wordRepository.findOthersWordsForAutocomplete.mockResolvedValue([
        { id: "word-1", text: "search" },
      ] as any);

      const result = await service.autocomplete("sea");

      expect(result.myWords).toEqual([]);
      expect(result.othersWords).toHaveLength(1);
    });

    it("should return both my words and others words when userId provided", async () => {
      wordRepository.findMyWordsForAutocomplete.mockResolvedValue([mockWord] as any);
      wordRepository.findOthersWordsForAutocomplete.mockResolvedValue([
        { id: "word-2", text: "searchable" },
      ] as any);

      const result = await service.autocomplete("sea", "user-1");

      expect(result.myWords).toHaveLength(1);
      expect(result.othersWords).toHaveLength(1);
    });

    it("should filter out duplicate terms from others words", async () => {
      wordRepository.findMyWordsForAutocomplete.mockResolvedValue([
        { ...mockWord, term: "search" },
      ] as any);
      wordRepository.findOthersWordsForAutocomplete.mockResolvedValue([
        { id: "word-2", text: "search" },
        { id: "word-3", text: "searchable" },
      ] as any);

      const result = await service.autocomplete("sea", "user-1");

      expect(result.myWords).toHaveLength(1);
      expect(result.othersWords).toHaveLength(1);
      expect(result.othersWords[0].term).toBe("searchable");
    });
  });

  describe("search", () => {
    it("should return empty results for empty term", async () => {
      const paginationDto = { page: 1, limit: 10, offset: 0 };

      const result = await service.search("", paginationDto);

      expect(result.data).toEqual([]);
    });

    it("should search for words with normalized term", async () => {
      const mockWords = [mockWord, { ...mockWord, id: "word-2" }];
      wordRepository.searchWithDefinitions.mockResolvedValue(mockWords);

      const paginationDto = { page: 1, limit: 10, offset: 0 };
      const result = await service.search("test", paginationDto);

      expect(result.data).toHaveLength(2);
      expect(result).toBeInstanceOf(PaginatedResponseDto);
    });

    it("should search with userId for including private words", async () => {
      const mockWords = [mockWord];
      wordRepository.searchWithDefinitions.mockResolvedValue(mockWords);

      const paginationDto = { page: 1, limit: 10, offset: 0 };
      await service.search("test", paginationDto, "user-1");

      expect(wordRepository.searchWithDefinitions).toHaveBeenCalledWith(
        "test",
        "user-1",
        10,
        undefined,
      );
    });

    it("should handle pagination with cursor", async () => {
      const mockWords = [mockWord];
      wordRepository.searchWithDefinitions.mockResolvedValue(mockWords);

      const paginationDto = { page: 1, limit: 10, offset: 0, cursor: "cursor-123" };
      const result = await service.search("test", paginationDto);

      expect(result.data).toHaveLength(1);
      expect(result.meta.nextCursor).toBeDefined();
    });
  });
});
