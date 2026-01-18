import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { PaginationDto } from "@shared";
import type { CreateWordDto } from "./dto/create-word.dto";
import type { UpdateWordDto } from "./dto/update-word.dto";
import type { Word } from "./entities/word.entity";
import { WordsRepository } from "./words.repository";
import { WordsService } from "./words.service";

describe("WordsService", () => {
  let service: WordsService;
  let repository: WordsRepository;

  const mockWord: Word = {
    id: "word-1",
    term: "test",
    userId: "user-1",
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WordsService,
        {
          provide: WordsRepository,
          useValue: {
            create: jest.fn(),
            findByUserId: jest.fn(),
            findById: jest.fn(),
            updateAll: jest.fn(),
            delete: jest.fn(),
            searchWithDefinitions: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WordsService>(WordsService);
    repository = module.get<WordsRepository>(WordsRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a word", async () => {
      const dto: CreateWordDto = { term: "test", isPublic: true };
      jest.spyOn(repository, "create").mockResolvedValue(mockWord);

      const result = await service.create("user-1", dto);
      expect(result).toEqual(mockWord);
      expect(repository.create).toHaveBeenCalledWith({ ...dto, userId: "user-1" });
    });
  });

  describe("findAllByUser", () => {
    it("should return words for a user", async () => {
      jest.spyOn(repository, "findByUserId").mockResolvedValue([mockWord]);

      const result = await service.findAllByUser("user-1");
      expect(result).toEqual([mockWord]);
      expect(repository.findByUserId).toHaveBeenCalledWith("user-1");
    });
  });

  describe("findOne", () => {
    it("should return a word if found and public", async () => {
      jest.spyOn(repository, "findById").mockResolvedValue(mockWord);

      const result = await service.findOne("word-1");
      expect(result).toEqual(mockWord);
    });

    it("should throw NotFoundException if word not found", async () => {
      jest.spyOn(repository, "findById").mockResolvedValue(null as any);

      await expect(service.findOne("non-existent")).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if word is private and user is not owner", async () => {
      const privateWord = { ...mockWord, isPublic: false, userId: "owner" };
      jest.spyOn(repository, "findById").mockResolvedValue(privateWord as any);

      await expect(service.findOne("word-1", "other-user")).rejects.toThrow(ForbiddenException);
    });

    it("should allow owner to see private word", async () => {
      const privateWord = { ...mockWord, isPublic: false, userId: "owner" };
      jest.spyOn(repository, "findById").mockResolvedValue(privateWord as any);

      const result = await service.findOne("word-1", "owner");
      expect(result).toEqual(privateWord);
    });
  });

  describe("update", () => {
    it("should update a word", async () => {
      const dto: UpdateWordDto = { term: "updated" };
      jest.spyOn(repository, "updateAll").mockResolvedValue({ ...mockWord, ...dto });

      const result = await service.update("word-1", dto);
      expect(result.term).toBe("updated");
    });

    it("should throw NotFoundException if word to update not found", async () => {
      jest.spyOn(repository, "updateAll").mockResolvedValue(null as any);

      await expect(service.update("word-1", { term: "test" })).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should remove a word", async () => {
      jest.spyOn(repository, "findById").mockResolvedValue(mockWord);
      jest.spyOn(repository, "delete").mockResolvedValue(undefined);

      await service.remove("word-1", "user-1");
      expect(repository.delete).toHaveBeenCalledWith("word-1");
    });
  });

  describe("search", () => {
    it("should return empty results for empty term", async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10, offset: 0 };
      const result = await service.search("", paginationDto);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it("should search for words", async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10, offset: 0 };
      jest.spyOn(repository, "searchWithDefinitions").mockReturnValue({
        listQuery: Promise.resolve([mockWord]),
        countQuery: Promise.resolve({ count: 1 }),
      } as any);

      const result = await service.search("test", paginationDto);
      expect(result.data).toEqual([mockWord]);
      expect(result.meta.total).toBe(1);
    });
  });
});
