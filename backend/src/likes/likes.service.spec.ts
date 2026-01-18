import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { DefinitionsRepository } from "../definitions/definitions.repository";
import { LikesRepository } from "./likes.repository";
import { LikesService } from "./likes.service";

describe("LikesService", () => {
  let service: LikesService;
  let likeRepository: LikesRepository;
  let definitionRepository: DefinitionsRepository;

  const mockDefinition = { id: "def-1", userId: "owner-1" };
  const mockLike = { id: "like-1", userId: "user-1", definitionId: "def-1" };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikesService,
        {
          provide: LikesRepository,
          useValue: {
            findByUserIdAndDefinitionId: jest.fn(),
            delete: jest.fn(),
            create: jest.fn(),
            findByDefinitionId: jest.fn(),
          },
        },
        {
          provide: DefinitionsRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LikesService>(LikesService);
    likeRepository = module.get<LikesRepository>(LikesRepository);
    definitionRepository = module.get<DefinitionsRepository>(DefinitionsRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("toggle", () => {
    it("should create a like if none exists", async () => {
      jest.spyOn(definitionRepository, "findById").mockResolvedValue(mockDefinition as any);
      jest.spyOn(likeRepository, "findByUserIdAndDefinitionId").mockResolvedValue(null as any);
      jest.spyOn(likeRepository, "create").mockResolvedValue(mockLike as any);

      const result = await service.toggle("user-1", "def-1");
      expect(result).toBe(true);
      expect(likeRepository.create).toHaveBeenCalled();
    });

    it("should delete a like if it exists", async () => {
      jest.spyOn(definitionRepository, "findById").mockResolvedValue(mockDefinition as any);
      jest.spyOn(likeRepository, "findByUserIdAndDefinitionId").mockResolvedValue(mockLike as any);
      jest.spyOn(likeRepository, "delete").mockResolvedValue(undefined);

      const result = await service.toggle("user-1", "def-1");
      expect(result).toBe(false);
      expect(likeRepository.delete).toHaveBeenCalledWith(mockLike.id);
    });

    it("should throw ForbiddenException if liking own definition", async () => {
      jest.spyOn(definitionRepository, "findById").mockResolvedValue(mockDefinition as any);
      await expect(service.toggle("owner-1", "def-1")).rejects.toThrow(ForbiddenException);
    });

    it("should throw NotFoundException if definition not found", async () => {
      jest.spyOn(definitionRepository, "findById").mockResolvedValue(null as any);
      await expect(service.toggle("user-1", "def-1")).rejects.toThrow(NotFoundException);
    });
  });
});
