import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PaginatedResponseDto, User } from "@stashy/shared";
import { EventEmitterService } from "../common/events/event-emitter.service";
import { NotificationsService } from "../notifications/notifications.service";
import { UsersRepository } from "../users/users.repository";
import { Follow } from "./entities/follow.entity";
import { FollowsRepository } from "./follows.repository";
import { FollowsService } from "./follows.service";

describe("FollowsService", () => {
  let service: FollowsService;
  let followRepository: jest.Mocked<FollowsRepository>;
  let userRepository: jest.Mocked<UsersRepository>;
  let notificationsService: jest.Mocked<NotificationsService>;
  let eventEmitter: jest.Mocked<EventEmitterService>;

  const mockUser: User = {
    id: "user-1",
    email: "test@example.com",
    nickname: "testuser",
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
    nickname: "otheruser",
    profilePicture: null,
    googleId: "google-2",
    bio: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    suspendedAt: null,
  };

  const mockFollow: Follow = {
    id: "follow-1",
    followerId: "user-1",
    followingId: "user-2",
    follower: mockUser,
    following: mockOtherUser,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockFollowRepo = {
      findExistingFollow: jest.fn(),
      createFollow: jest.fn(),
      restoreRelation: jest.fn(),
      findById: jest.fn(),
      deleteFollow: jest.fn(),
      findFollowers: jest.fn(),
      findFollowings: jest.fn(),
      getFollowerCount: jest.fn(),
      getFollowingCount: jest.fn(),
      findFollowingIds: jest.fn(),
      findFollowerIds: jest.fn(),
    };

    const mockUserRepo = {
      findById: jest.fn(),
    };

    const mockNotificationsService = {
      createNotification: jest.fn().mockResolvedValue(undefined),
    };

    const mockEventEmitter = {
      emitFollow: jest.fn().mockResolvedValue(undefined),
      emitUnfollow: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowsService,
        {
          provide: FollowsRepository,
          useValue: mockFollowRepo,
        },
        {
          provide: UsersRepository,
          useValue: mockUserRepo,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: EventEmitterService,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<FollowsService>(FollowsService);
    followRepository = module.get(FollowsRepository);
    userRepository = module.get(UsersRepository);
    notificationsService = module.get(NotificationsService);
    eventEmitter = module.get(EventEmitterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("follow", () => {
    it("should follow a user", async () => {
      userRepository.findById.mockResolvedValue(mockOtherUser);
      followRepository.findExistingFollow.mockResolvedValue(null);
      followRepository.createFollow.mockResolvedValue([mockFollow] as any);

      const result = await service.follow("user-1", "user-2");

      expect(result.followerId).toBe("user-1");
      expect(result.followingId).toBe("user-2");
      expect(eventEmitter.emitFollow).toHaveBeenCalledWith("user-1", "user-2");
    });

    it("should restore soft-deleted follow", async () => {
      const softDeletedFollow = { ...mockFollow, deletedAt: new Date() };
      userRepository.findById.mockResolvedValue(mockOtherUser);
      followRepository.findExistingFollow.mockResolvedValue(softDeletedFollow);
      followRepository.restoreRelation.mockResolvedValue(undefined);
      followRepository.findById.mockResolvedValue(mockFollow);

      const result = await service.follow("user-1", "user-2");

      expect(followRepository.restoreRelation).toHaveBeenCalledWith("follow-1");
      expect(eventEmitter.emitFollow).toHaveBeenCalledWith("user-1", "user-2");
    });

    it("should throw BadRequestException for self-follow", async () => {
      await expect(service.follow("user-1", "user-1")).rejects.toThrow(BadRequestException);
    });

    it("should throw NotFoundException if user to follow not found", async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.follow("user-1", "non-existent")).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if already following", async () => {
      userRepository.findById.mockResolvedValue(mockOtherUser);
      followRepository.findExistingFollow.mockResolvedValue(mockFollow);

      await expect(service.follow("user-1", "user-2")).rejects.toThrow(BadRequestException);
    });
  });

  describe("unfollow", () => {
    it("should unfollow a user", async () => {
      followRepository.findExistingFollow.mockResolvedValue(mockFollow);
      followRepository.deleteFollow.mockResolvedValue(undefined);

      await service.unfollow("user-1", "user-2");

      expect(followRepository.deleteFollow).toHaveBeenCalledWith("follow-1");
      expect(eventEmitter.emitUnfollow).toHaveBeenCalledWith("user-1", "user-2");
    });

    it("should throw NotFoundException if follow relationship not found", async () => {
      followRepository.findExistingFollow.mockResolvedValue(null);

      await expect(service.unfollow("user-1", "user-2")).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException if follow is already soft-deleted", async () => {
      followRepository.findExistingFollow.mockResolvedValue({
        ...mockFollow,
        deletedAt: new Date(),
      });

      await expect(service.unfollow("user-1", "user-2")).rejects.toThrow(NotFoundException);
    });
  });

  describe("checkFollowing", () => {
    it("should return true if following", async () => {
      followRepository.findExistingFollow.mockResolvedValue(mockFollow);

      const result = await service.checkFollowing("user-1", "user-2");

      expect(result).toBe(true);
    });

    it("should return false if not following", async () => {
      followRepository.findExistingFollow.mockResolvedValue(null);

      const result = await service.checkFollowing("user-1", "user-2");

      expect(result).toBe(false);
    });

    it("should return false if follow is soft-deleted", async () => {
      followRepository.findExistingFollow.mockResolvedValue({
        ...mockFollow,
        deletedAt: new Date(),
      });

      const result = await service.checkFollowing("user-1", "user-2");

      expect(result).toBe(false);
    });
  });

  describe("getFollowers", () => {
    it("should return paginated followers", async () => {
      const mockFollowers = [
        { ...mockUser, followCreatedAt: new Date() },
        { ...mockOtherUser, followCreatedAt: new Date() },
      ];
      followRepository.findFollowers.mockResolvedValue(mockFollowers as any);

      const result = await service.getFollowers("user-2", { page: 1, limit: 10, offset: 0 });

      expect(result.data).toHaveLength(2);
      expect(result).toBeInstanceOf(PaginatedResponseDto);
    });
  });

  describe("getFollowing", () => {
    it("should return paginated following", async () => {
      const mockFollowings = [
        { ...mockUser, followCreatedAt: new Date() },
        { ...mockOtherUser, followCreatedAt: new Date() },
      ];
      followRepository.findFollowings.mockResolvedValue(mockFollowings as any);

      const result = await service.getFollowing("user-1", { page: 1, limit: 10, offset: 0 });

      expect(result.data).toHaveLength(2);
      expect(result).toBeInstanceOf(PaginatedResponseDto);
    });
  });

  describe("getFollowStats", () => {
    it("should return follower and following counts", async () => {
      followRepository.getFollowerCount.mockResolvedValue({ count: "10" } as any);
      followRepository.getFollowingCount.mockResolvedValue({ count: "5" } as any);

      const result = await service.getFollowStats("user-1");

      expect(result.followersCount).toBe(10);
      expect(result.followingCount).toBe(5);
    });
  });

  describe("getFollowingIds", () => {
    it("should return list of following user IDs", async () => {
      followRepository.findFollowingIds.mockResolvedValue(["user-2", "user-3"]);

      const result = await service.getFollowingIds("user-1");

      expect(result).toHaveLength(2);
      expect(result).toContain("user-2");
      expect(result).toContain("user-3");
    });
  });

  describe("getFollowerIds", () => {
    it("should return list of follower user IDs", async () => {
      followRepository.findFollowerIds.mockResolvedValue(["user-2", "user-3"]);

      const result = await service.getFollowerIds("user-1");

      expect(result).toHaveLength(2);
      expect(result).toContain("user-2");
      expect(result).toContain("user-3");
    });
  });
});
