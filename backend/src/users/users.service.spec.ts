import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PaginatedResponseDto } from "@stashy/shared";
import { Users } from "@stashy/shared/types/db_entity.generated";
import { DefinitionsRepository } from "../definitions/definitions.repository";
import { FollowsService } from "../follows/follows.service";
import { Word } from "../words/entities/word.entity";
import { WordsRepository } from "../words/words.repository";
import { UsersRepository } from "./users.repository";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  let service: UsersService;
  let userRepository: jest.Mocked<UsersRepository>;
  let wordRepository: jest.Mocked<WordsRepository>;
  let definitionRepository: jest.Mocked<DefinitionsRepository>;
  let followsService: jest.Mocked<FollowsService>;

  const mockUser: Users = {
    id: "user-1",
    email: "test@example.com",
    nickname: "testuser",
    profilePicture: "https://example.com/pic.jpg",
    googleId: "google-123",
    bio: "Test bio",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    suspendedAt: null,
  };

  beforeEach(async () => {
    const mockUserRepo = {
      findByGoogleId: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      insert: jest.fn(),
      findByNickname: jest.fn(),
      updateNickname: jest.fn(),
      updateProfile: jest.fn(),
    };

    const mockWordRepo = {
      countPublicByUserId: jest.fn(),
      findPublicByUserId: jest.fn(),
    };

    const mockDefinitionRepo = {
      getCountByUserId: jest.fn(),
    };

    const mockFollowsService = {
      getFollowStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUserRepo,
        },
        {
          provide: WordsRepository,
          useValue: mockWordRepo,
        },
        {
          provide: DefinitionsRepository,
          useValue: mockDefinitionRepo,
        },
        {
          provide: FollowsService,
          useValue: mockFollowsService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(UsersRepository);
    wordRepository = module.get(WordsRepository);
    definitionRepository = module.get(DefinitionsRepository);
    followsService = module.get(FollowsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findByGoogleId", () => {
    it("should return a user by google id", async () => {
      userRepository.findByGoogleId.mockResolvedValue(mockUser);

      const result = await service.findByGoogleId("google-123");

      expect(result).toEqual(mockUser);
      expect(userRepository.findByGoogleId).toHaveBeenCalledWith("google-123");
    });

    it("should return null for non-existent google id", async () => {
      userRepository.findByGoogleId.mockResolvedValue(null);

      const result = await service.findByGoogleId("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("findById", () => {
    it("should return a user by id", async () => {
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findById("user-1");

      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith("user-1");
    });

    it("should return null for non-existent id", async () => {
      userRepository.findById.mockResolvedValue(null);

      const result = await service.findById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("findByEmail", () => {
    it("should return a user by email", async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail("test@example.com");

      expect(result).toEqual(mockUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith("test@example.com");
    });

    it("should return null for non-existent email", async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail("nonexistent@example.com");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const createDto = {
        googleId: "new-google-id",
        email: "newuser@example.com",
        nickname: "newuser",
        profilePicture: "https://example.com/pic.jpg",
      };
      const newUser = { ...mockUser, ...createDto };
      userRepository.insert.mockResolvedValue([newUser] as any);

      const result = await service.create(createDto);

      expect(result.email).toBe("newuser@example.com");
      expect(result.nickname).toBe("newuser");
      expect(userRepository.insert).toHaveBeenCalledWith(createDto);
    });
  });

  describe("updateNickname", () => {
    it("should update nickname if available", async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.findByNickname.mockResolvedValue(null);
      userRepository.updateNickname.mockResolvedValue([{ ...mockUser, nickname: "newnickname" }]);

      const result = await service.updateNickname("user-1", "newnickname");

      expect(result.nickname).toBe("newnickname");
    });

    it("should throw ConflictException if nickname taken by another user", async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.findByNickname.mockResolvedValue({ ...mockUser, id: "other-user" } as Users);

      await expect(service.updateNickname("user-1", "taken")).rejects.toThrow(ConflictException);
    });

    it("should allow user to keep same nickname", async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.findByNickname.mockResolvedValue(mockUser);
      userRepository.updateNickname.mockResolvedValue([mockUser]);

      const result = await service.updateNickname("user-1", "testuser");

      expect(result.nickname).toBe("testuser");
    });

    it("should throw NotFoundException if user not found", async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.updateNickname("non-existent", "new")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("updateProfile", () => {
    it("should update profile fields", async () => {
      const updates = { nickname: "updated", bio: "My bio" };
      userRepository.findByNickname.mockResolvedValue(null);
      userRepository.updateProfile.mockResolvedValue({ ...mockUser, ...updates });

      const result = await service.updateProfile("user-1", updates);

      expect(result.nickname).toBe("updated");
      expect(result.bio).toBe("My bio");
    });

    it("should throw ConflictException if nickname is taken", async () => {
      userRepository.findByNickname.mockResolvedValue({ ...mockUser, id: "other-user" } as Users);

      await expect(service.updateProfile("user-1", { nickname: "existing" })).rejects.toThrow(
        ConflictException,
      );
    });

    it("should throw NotFoundException if user not found", async () => {
      userRepository.findByNickname.mockResolvedValue(null);
      userRepository.updateProfile.mockResolvedValue(null);

      await expect(service.updateProfile("user-1", { bio: "test" })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("getUserProfile", () => {
    it("should return user profile with stats", async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      wordRepository.countPublicByUserId.mockResolvedValue({ count: "2" } as any);
      definitionRepository.getCountByUserId.mockResolvedValue({ count: "5" } as any);
      followsService.getFollowStats.mockResolvedValue({
        followersCount: 10,
        followingCount: 5,
      });

      const result = await service.getUserProfile("user-1");

      expect(result.user.id).toBe("user-1");
      expect(result.user.nickname).toBe("testuser");
      expect(result.stats.wordsCount).toBe(2);
      expect(result.stats.definitionsCount).toBe(5);
      expect(result.stats.followersCount).toBe(10);
      expect(result.stats.followingCount).toBe(5);
    });

    it("should throw NotFoundException if user not found", async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.getUserProfile("non-existent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("getUserByNickname", () => {
    it("should return user by nickname", async () => {
      userRepository.findByNickname.mockResolvedValue(mockUser);

      const result = await service.getUserByNickname("testuser");

      expect(result).toEqual(mockUser);
    });

    it("should throw NotFoundException if user not found", async () => {
      userRepository.findByNickname.mockResolvedValue(null);

      await expect(service.getUserByNickname("nonexistent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("getUserProfileByNickname", () => {
    it("should return user profile by nickname", async () => {
      userRepository.findByNickname.mockResolvedValue(mockUser);
      wordRepository.countPublicByUserId.mockResolvedValue({ count: "2" } as any);
      definitionRepository.getCountByUserId.mockResolvedValue({ count: "5" } as any);
      followsService.getFollowStats.mockResolvedValue({
        followersCount: 10,
        followingCount: 5,
      });

      const result = await service.getUserProfileByNickname("testuser");

      expect(result.user.id).toBe("user-1");
      expect(result.user.nickname).toBe("testuser");
    });

    it("should throw NotFoundException if user not found", async () => {
      userRepository.findByNickname.mockResolvedValue(null);

      await expect(service.getUserProfileByNickname("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("getUserPublicWords", () => {
    it("should return paginated public words", async () => {
      const mockWords: Word[] = [
        {
          id: "word-1",
          term: "word1",
          userId: "user-1",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: "word-2",
          term: "word2",
          userId: "user-1",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];
      wordRepository.findPublicByUserId.mockResolvedValue(mockWords as any);

      const result = await service.getUserPublicWords("user-1", {
        page: 1,
        limit: 10,
        offset: 0,
      });

      expect(result.data).toHaveLength(2);
      expect(result).toBeInstanceOf(PaginatedResponseDto);
    });

    it("should handle empty results", async () => {
      wordRepository.findPublicByUserId.mockResolvedValue([]);

      const result = await service.getUserPublicWords("user-1", {
        page: 1,
        limit: 10,
        offset: 0,
      });

      expect(result.data).toHaveLength(0);
    });
  });
});
