import { Test, type TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

describe("UsersController", () => {
  let controller: UsersController;
  let _service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getUsers: jest.fn().mockResolvedValue({ data: [], meta: {} }),
            createUser: jest.fn().mockResolvedValue({ id: "1" }),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    _service = module.get<UsersService>(UsersService);
  });

  it("should get users", async () => {
    const result = await controller.getUsers({ page: 1, limit: 10, offset: 0 });
    expect(result.data).toEqual([]);
  });

  it("should create a user", async () => {
    const result = await controller.createUser({ email: "test@example.com", nickname: "test" });
    expect(result.id).toBe("1");
  });
});
