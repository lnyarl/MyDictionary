import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { User } from "@shared";
import { DefinitionsRepository } from "../definitions/definitions.repository";
import { FollowsService } from "../follows/follows.service";
import { WordsRepository } from "../words/words.repository";
import { UsersRepository } from "./users.repository";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  let service: UsersService;
  let userRepository: UsersRepository;
  let wordRepository: WordsRepository;
  let definitionRepository: DefinitionsRepository;
  let followsService: FollowsService;

  const mockUser: User = {
    id: "user-1",
    googleId: "google-1",
    email: "test@example.com",
    nickname: "testuser",
    profilePicture: "https://example.com/pic.jpg",
    bio: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findByGoogleId: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            insert: jest.fn(),
            findByNickname: jest.fn(),
            updateNickname: jest.fn(),
            updateEmailAndPicture: jest.fn(),
          },
        },
        {
          provide: WordsRepository,
          useValue: {
            countPublicByUserId: jest.fn(),
            findPublicByUserId: jest.fn(),
          },
        },
        {
          provide: DefinitionsRepository,
          useValue: {
            getCountByUserId: jest.fn(),
            findByUserId: jest.fn(),
          },
        },
        {
          provide: FollowsService,
          useValue: {
            getFollowStats: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<UsersRepository>(UsersRepository);
    wordRepository = module.get<WordsRepository>(WordsRepository);
    definitionRepository = module.get<DefinitionsRepository>(DefinitionsRepository);
    followsService = module.get<FollowsService>(FollowsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findByGoogleId", () => {
    it("should return a user by google id", async () => {
      const promise = Promise.resolve(mockUser);
      (promise as any).toQuery = jest.fn().mockReturnValue("query");
      jest.spyOn(userRepository, "findByGoogleId").mockReturnValue(promise as any);

      const result = await service.findByGoogleId("google-1");
      expect(result).toEqual(mockUser);
    });
  });

  describe("findById", () => {
    it("should return a user by id", async () => {
      jest.spyOn(userRepository, "findById").mockResolvedValue(mockUser);
      const result = await service.findById("user-1");
      expect(result).toEqual(mockUser);
    });
  });

  describe("updateNickname", () => {
    it("should update nickname if available", async () => {
      jest.spyOn(userRepository, "findById").mockResolvedValue(mockUser);
      jest.spyOn(userRepository, "findByNickname").mockResolvedValue(null as any);
      jest
        .spyOn(userRepository, "updateNickname")
        .mockResolvedValue({ ...mockUser, nickname: "new" });

      const result = await service.updateNickname("user-1", "new");
      expect(result.nickname).toBe("new");
    });

    it("should throw ConflictException if nickname taken", async () => {
      jest.spyOn(userRepository, "findById").mockResolvedValue(mockUser);
      jest.spyOn(userRepository, "findByNickname").mockResolvedValue({ id: "other" } as any);

      await expect(service.updateNickname("user-1", "taken")).rejects.toThrow(ConflictException);
    });

    it("should throw NotFoundException if user not found", async () => {
      jest.spyOn(userRepository, "findById").mockResolvedValue(null as any);
      await expect(service.updateNickname("user-1", "new")).rejects.toThrow(NotFoundException);
    });
  });

  describe("getUserProfile", () => {
    it("should return user profile with stats", async () => {
      jest.spyOn(userRepository, "findById").mockResolvedValue(mockUser);
      jest.spyOn(wordRepository, "countPublicByUserId").mockResolvedValue(5 as any);
      jest.spyOn(definitionRepository, "getCountByUserId").mockResolvedValue(10 as any);
      jest
        .spyOn(followsService, "getFollowStats")
        .mockResolvedValue({ followersCount: 1, followingCount: 2 });

      const result = await service.getUserProfile("user-1");
      expect(result.user.id).toBe(mockUser.id);
      expect(result.stats.wordsCount).toBe(5);
      expect(result.stats.definitionsCount).toBe(10);
      expect(result.stats.followersCount).toBe(1);
    });
  });
});
