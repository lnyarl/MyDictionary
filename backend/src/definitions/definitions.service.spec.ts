import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { WordsRepository } from "../words/words.repository";
import { DefinitionsRepository } from "./definitions.repository";
import { DefinitionsService } from "./definitions.service";
import { CreateDefinitionDto } from "./dto/create-definition.dto";

describe("DefinitionsService", () => {
  let service: DefinitionsService;
  let definitionRepository: DefinitionsRepository;
  let wordRepository: WordsRepository;

  const mockWord = { id: "word-1", isPublic: true, userId: "owner-1" };
  const mockDefinition = {
    id: "def-1",
    content: "test def",
    wordId: "word-1",
    userId: "user-1",
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DefinitionsService,
        {
          provide: DefinitionsRepository,
          useValue: {
            create: jest.fn(),
            findByWordIdForEachUser: jest.fn(),
            findByIdWithPublic: jest.fn(),
            findById: jest.fn(),
            delete: jest.fn(),
            findByWordIdAndUserId: jest.fn(),
          },
        },
        {
          provide: WordsRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DefinitionsService>(DefinitionsService);
    definitionRepository = module.get<DefinitionsRepository>(DefinitionsRepository);
    wordRepository = module.get<WordsRepository>(WordsRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    const dto: CreateDefinitionDto = { wordId: "word-1", content: "test" };

    it("should create a definition", async () => {
      jest.spyOn(wordRepository, "findById").mockResolvedValue(mockWord as any);
      jest.spyOn(definitionRepository, "create").mockResolvedValue(mockDefinition as any);

      const result = await service.create("user-1", dto);
      expect(result).toEqual(mockDefinition);
    });

    it("should throw NotFoundException if word not found", async () => {
      jest.spyOn(wordRepository, "findById").mockResolvedValue(null as any);
      await expect(service.create("user-1", dto)).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if word private and user not owner", async () => {
      jest
        .spyOn(wordRepository, "findById")
        .mockResolvedValue({ ...mockWord, isPublic: false } as any);
      await expect(service.create("user-1", dto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe("findAllByWord", () => {
    it("should return definitions for a word", async () => {
      jest.spyOn(wordRepository, "findById").mockResolvedValue(mockWord as any);
      jest
        .spyOn(definitionRepository, "findByWordIdForEachUser")
        .mockResolvedValue([
          { id: "def-1", content: "test", word_id: "word-1", user_id: "user-1", likes_count: 0 },
        ] as any);

      const result = await service.findAllByWord("word-1");
      expect(result[0].id).toBe("def-1");
    });
  });

  describe("remove", () => {
    it("should remove definition", async () => {
      jest.spyOn(definitionRepository, "findById").mockResolvedValue(mockDefinition as any);
      jest.spyOn(definitionRepository, "delete").mockResolvedValue(undefined);

      await service.remove("def-1", "user-1");
      expect(definitionRepository.delete).toHaveBeenCalledWith("def-1");
    });

    it("should throw ForbiddenException if not owner", async () => {
      jest.spyOn(definitionRepository, "findById").mockResolvedValue(mockDefinition as any);
      await expect(service.remove("def-1", "other")).rejects.toThrow(ForbiddenException);
    });
  });
});
