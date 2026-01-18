import { Test, type TestingModule } from "@nestjs/testing";
import { AdminUsersController } from "./admin-users.controller";
import { AdminUsersService } from "./admin-users.service";
import { AdminRole } from "./entities/admin-user.entity";

describe("AdminUsersController", () => {
  let controller: AdminUsersController;
  let _service: AdminUsersService;

  const mockAdmin = {
    id: "a-1",
    username: "test",
    role: AdminRole.OPERATOR,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUsersController],
      providers: [
        {
          provide: AdminUsersService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockAdmin]),
            create: jest.fn().mockResolvedValue(mockAdmin),
            updateRole: jest.fn().mockResolvedValue(mockAdmin),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminUsersController>(AdminUsersController);
    _service = module.get<AdminUsersService>(AdminUsersService);
  });

  it("should find all admins", async () => {
    const result = await controller.findAll();
    expect(result[0].username).toBe("test");
  });

  it("should create an admin", async () => {
    const result = await controller.create({
      username: "test",
      password: "pwd",
      role: AdminRole.OPERATOR,
    });
    expect(result.username).toBe("test");
  });
});
