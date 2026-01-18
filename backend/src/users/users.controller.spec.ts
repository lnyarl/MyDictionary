import { Test, type TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

describe("UsersController", () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = { id: "u-1", nickname: "test" };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            updateNickname: jest.fn().mockResolvedValue({ ...mockUser, nickname: "new" }),
            getUserProfile: jest.fn().mockResolvedValue({ user: mockUser, stats: {} }),
            getUserPublicWords: jest.fn().mockResolvedValue({ data: [], meta: {} }),
            getUserPublicDefinitions: jest.fn().mockResolvedValue({ data: [], meta: {} }),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it("should return current user", () => {
    expect(controller.getMe(mockUser as any)).toEqual(mockUser);
  });

  it("should update nickname", async () => {
    const result = await controller.updateNickname(mockUser as any, { nickname: "new" });
    expect(result.nickname).toBe("new");
    expect(service.updateNickname).toHaveBeenCalledWith("u-1", "new");
  });

  it("should get user profile", async () => {
    const result = await controller.getUserProfile("u-1");
    expect(result.user).toEqual(mockUser);
  });
});
