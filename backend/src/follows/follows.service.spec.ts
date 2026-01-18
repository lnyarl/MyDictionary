import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { UsersRepository } from "../users/users.repository";
import { FollowsRepository } from "./follows.repository";
import { FollowsService } from "./follows.service";

describe("FollowsService", () => {
  let service: FollowsService;
  let followRepository: FollowsRepository;
  let userRepository: UsersRepository;

  const mockFollow = { id: "f-1", followerId: "u-1", followingId: "u-2", deletedAt: null };
  const mockUser = { id: "u-2", nickname: "user2" };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowsService,
        {
          provide: FollowsRepository,
          useValue: {
            findExistingFollow: jest.fn(),
            restoreRelation: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            getFollowerCount: jest.fn(),
            getFollowingCount: jest.fn(),
          },
        },
        {
          provide: UsersRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FollowsService>(FollowsService);
    followRepository = module.get<FollowsRepository>(FollowsRepository);
    userRepository = module.get<UsersRepository>(UsersRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("follow", () => {
    it("should follow a user", async () => {
      jest.spyOn(userRepository, "findById").mockResolvedValue(mockUser as any);
      jest.spyOn(followRepository, "findExistingFollow").mockResolvedValue(null as any);
      jest.spyOn(followRepository, "create").mockResolvedValue(mockFollow as any);

      const result = await service.follow("u-1", "u-2");
      expect(result).toEqual(mockFollow);
    });

    it("should throw BadRequestException for self-follow", async () => {
      await expect(service.follow("u-1", "u-1")).rejects.toThrow(BadRequestException);
    });

    it("should throw NotFoundException if user to follow not found", async () => {
      jest.spyOn(userRepository, "findById").mockResolvedValue(null as any);
      await expect(service.follow("u-1", "u-2")).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if already following", async () => {
      jest.spyOn(userRepository, "findById").mockResolvedValue(mockUser as any);
      jest.spyOn(followRepository, "findExistingFollow").mockResolvedValue(mockFollow as any);

      await expect(service.follow("u-1", "u-2")).rejects.toThrow(BadRequestException);
    });
  });

  describe("unfollow", () => {
    it("should unfollow a user", async () => {
      jest.spyOn(followRepository, "findExistingFollow").mockResolvedValue(mockFollow as any);
      jest.spyOn(followRepository, "delete").mockResolvedValue(undefined);

      await service.unfollow("u-1", "u-2");
      expect(followRepository.delete).toHaveBeenCalledWith(mockFollow.id);
    });

    it("should throw NotFoundException if follow not found", async () => {
      jest.spyOn(followRepository, "findExistingFollow").mockResolvedValue(null as any);
      await expect(service.unfollow("u-1", "u-2")).rejects.toThrow(NotFoundException);
    });
  });
});
