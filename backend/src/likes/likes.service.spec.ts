import { getQueueToken } from "@nestjs/bullmq";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Queue } from "bullmq";
import { EventEmitterService } from "../common/events/event-emitter.service";
import { DefinitionsRepository } from "../definitions/definitions.repository";
import { NotificationsService } from "../notifications/notifications.service";
import { User } from "../users/entities/user.entity";
import { UsersRepository } from "../users/users.repository";
import { Word } from "../words/entities/word.entity";
import { WordsRepository } from "../words/words.repository";
import { Like } from "./entities/like.entity";
import { LikesRepository } from "./likes.repository";
import { LikesService } from "./likes.service";

describe("LikesService", () => {
  let service: LikesService;
  let likeRepository: jest.Mocked<LikesRepository>;
  let definitionRepository: jest.Mocked<DefinitionsRepository>;
  let usersRepository: jest.Mocked<UsersRepository>;
  let wordsRepository: jest.Mocked<WordsRepository>;
  let notificationsService: jest.Mocked<NotificationsService>;
  let likesQueue: jest.Mocked<Queue>;
  let eventEmitter: jest.Mocked<EventEmitterService>;

  const mockUser: User = {
    id: "user-1",
    email: "user@example.com",
    nickname: "user1",
    profilePicture: null,
    googleId: "google-1",
    bio: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    suspendedAt: null,
  };

  const mockOtherUser: User = {
    id: "user-2",
    email: "other@example.com",
    nickname: "user2",
    profilePicture: null,
    googleId: "google-2",
    bio: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    suspendedAt: null,
  };

  const mockWord: Word = {
    id: "word-1",
    term: "testword",
    userId: "user-2",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockDefinition = {
    id: "def-1",
    content: "test definition",
    wordId: "word-1",
    userId: "user-2",
    isPublic: true,
  };

  const mockLike: Like = {
    id: "like-1",
    userId: "user-1",
    definitionId: "def-1",
    user: mockUser,
    definition: mockDefinition as any,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockLikeRepo = {
      findByUserIdAndDefinitionIdWithDeleted: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      restore: jest.fn(),
      findByDefinitionId: jest.fn(),
      findLikeInfoByDefinitionIds: jest.fn(),
    };

    const mockDefinitionRepo = {
      findById: jest.fn(),
    };

    const mockUsersRepo = {
      findById: jest.fn(),
    };

    const mockWordsRepo = {
      findById: jest.fn(),
    };

    const mockNotificationsService = {
      createNotification: jest.fn().mockResolvedValue(undefined),
    };

    const mockLikesQueue = {
      add: jest.fn().mockResolvedValue(undefined),
    };

    const mockEventEmitter = {
      emitLike: jest.fn().mockResolvedValue(undefined),
      emitUnlike: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikesService,
        {
          provide: LikesRepository,
          useValue: mockLikeRepo,
        },
        {
          provide: DefinitionsRepository,
          useValue: mockDefinitionRepo,
        },
        {
          provide: UsersRepository,
          useValue: mockUsersRepo,
        },
        {
          provide: WordsRepository,
          useValue: mockWordsRepo,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: getQueueToken("likes"),
          useValue: mockLikesQueue,
        },
        {
          provide: EventEmitterService,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<LikesService>(LikesService);
    likeRepository = module.get(LikesRepository);
    definitionRepository = module.get(DefinitionsRepository);
    usersRepository = module.get(UsersRepository);
    wordsRepository = module.get(WordsRepository);
    notificationsService = module.get(NotificationsService);
    likesQueue = module.get(getQueueToken("likes"));
    eventEmitter = module.get(EventEmitterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("toggle", () => {
    it("should add like job to queue", async () => {
      await service.toggle("user-1", "def-1");

      expect(likesQueue.add).toHaveBeenCalledWith("toggle", {
        userId: "user-1",
        definitionId: "def-1",
      });
    });
  });

  describe("executeToggle", () => {
    it("should create a like if none exists", async () => {
      definitionRepository.findById.mockResolvedValue(mockDefinition as any);
      likeRepository.findByUserIdAndDefinitionIdWithDeleted.mockResolvedValue(null);
      likeRepository.create.mockResolvedValue([mockLike] as any);
      usersRepository.findById.mockResolvedValue(mockUser);
      wordsRepository.findById.mockResolvedValue(mockWord);

      const result = await service.executeToggle("user-1", "def-1");

      expect(result).toBe(true);
      expect(likeRepository.create).toHaveBeenCalledWith({
        userId: "user-1",
        definitionId: "def-1",
      });
      expect(eventEmitter.emitLike).toHaveBeenCalledWith("user-1", "def-1", "user-2");
      expect(notificationsService.createNotification).toHaveBeenCalled();
    });

    it("should delete a like if it exists", async () => {
      definitionRepository.findById.mockResolvedValue(mockDefinition as any);
      likeRepository.findByUserIdAndDefinitionIdWithDeleted.mockResolvedValue(mockLike);
      likeRepository.delete.mockResolvedValue(undefined);

      const result = await service.executeToggle("user-1", "def-1");

      expect(result).toBe(false);
      expect(likeRepository.delete).toHaveBeenCalledWith("like-1");
      expect(eventEmitter.emitUnlike).toHaveBeenCalledWith("user-1", "def-1", "user-2");
    });

    it("should restore a soft-deleted like", async () => {
      const softDeletedLike = { ...mockLike, deletedAt: new Date() };
      definitionRepository.findById.mockResolvedValue(mockDefinition as any);
      likeRepository.findByUserIdAndDefinitionIdWithDeleted.mockResolvedValue(softDeletedLike);
      likeRepository.restore.mockResolvedValue(undefined);
      usersRepository.findById.mockResolvedValue(mockUser);
      wordsRepository.findById.mockResolvedValue(mockWord);

      const result = await service.executeToggle("user-1", "def-1");

      expect(result).toBe(true);
      expect(likeRepository.restore).toHaveBeenCalledWith("like-1");
      expect(eventEmitter.emitLike).toHaveBeenCalledWith("user-1", "def-1", "user-2");
    });

    it("should throw NotFoundException if definition not found", async () => {
      definitionRepository.findById.mockResolvedValue(null);

      await expect(service.executeToggle("user-1", "non-existent")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should allow liking own definition (no restriction in service)", async () => {
      definitionRepository.findById.mockResolvedValue({
        ...mockDefinition,
        userId: "user-1",
      } as any);
      likeRepository.findByUserIdAndDefinitionIdWithDeleted.mockResolvedValue(null);
      likeRepository.create.mockResolvedValue([mockLike] as any);

      const result = await service.executeToggle("user-1", "def-1");

      expect(result).toBe(true);
      expect(likeRepository.create).toHaveBeenCalled();
    });

    it("should not create notification if liker not found", async () => {
      definitionRepository.findById.mockResolvedValue(mockDefinition as any);
      likeRepository.findByUserIdAndDefinitionIdWithDeleted.mockResolvedValue(null);
      likeRepository.create.mockResolvedValue([mockLike] as any);
      usersRepository.findById.mockResolvedValue(null);

      await service.executeToggle("user-1", "def-1");

      expect(notificationsService.createNotification).not.toHaveBeenCalled();
    });

    it("should not create notification if word not found", async () => {
      definitionRepository.findById.mockResolvedValue(mockDefinition as any);
      likeRepository.findByUserIdAndDefinitionIdWithDeleted.mockResolvedValue(null);
      likeRepository.create.mockResolvedValue([mockLike] as any);
      usersRepository.findById.mockResolvedValue(mockUser);
      wordsRepository.findById.mockResolvedValue(null);

      await service.executeToggle("user-1", "def-1");

      expect(notificationsService.createNotification).not.toHaveBeenCalled();
    });
  });

  describe("checkUserLike", () => {
    it("should return true if user liked the definition", async () => {
      likeRepository.findByUserIdAndDefinitionIdWithDeleted.mockResolvedValue(mockLike);

      const result = await service.checkUserLike("user-1", "def-1");

      expect(result).toBe(true);
    });

    it("should return false if user has not liked the definition", async () => {
      likeRepository.findByUserIdAndDefinitionIdWithDeleted.mockResolvedValue(null);

      const result = await service.checkUserLike("user-1", "def-1");

      expect(result).toBe(false);
    });

    it("should return false if like is soft-deleted", async () => {
      likeRepository.findByUserIdAndDefinitionIdWithDeleted.mockResolvedValue({
        ...mockLike,
        deletedAt: new Date(),
      });

      const result = await service.checkUserLike("user-1", "def-1");

      expect(result).toBe(false);
    });
  });

  describe("getLikesByDefinition", () => {
    it("should return all likes for a definition", async () => {
      const likes = [mockLike, { ...mockLike, id: "like-2", userId: "user-3" }];
      likeRepository.findByDefinitionId.mockResolvedValue(likes);

      const result = await service.getLikesByDefinition("def-1");

      expect(result).toHaveLength(2);
      expect(likeRepository.findByDefinitionId).toHaveBeenCalledWith("def-1");
    });

    it("should return empty array if no likes", async () => {
      likeRepository.findByDefinitionId.mockResolvedValue([]);

      const result = await service.getLikesByDefinition("def-1");

      expect(result).toHaveLength(0);
    });
  });

  describe("getLikeInfoByDefinitions", () => {
    it("should return like info for multiple definitions", async () => {
      const likeInfo = [
        { definitionId: "def-1", isLiked: true, likesCount: 5 },
        { definitionId: "def-2", isLiked: false, likesCount: 3 },
      ];
      likeRepository.findLikeInfoByDefinitionIds.mockResolvedValue(likeInfo as any);

      const result = await service.getLikeInfoByDefinitions(["def-1", "def-2"], "user-1");

      expect(result["def-1"]).toEqual({ isLiked: true, likesCount: 5 });
      expect(result["def-2"]).toEqual({ isLiked: false, likesCount: 3 });
    });

    it("should return empty object for empty definition ids", async () => {
      likeRepository.findLikeInfoByDefinitionIds.mockResolvedValue([]);

      const result = await service.getLikeInfoByDefinitions([], "user-1");

      expect(result).toEqual({});
    });
  });
});
