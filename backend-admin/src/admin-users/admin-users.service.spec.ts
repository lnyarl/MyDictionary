import { ConflictException, ForbiddenException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { AdminUsersRepository } from "./admin-users.repository";
import { AdminUsersService } from "./admin-users.service";
import { AdminRole } from "./entities/admin-user.entity";

describe("AdminUsersService", () => {
  let service: AdminUsersService;
  let repository: AdminUsersRepository;

  const mockAdmin = { id: "a-1", username: "test", role: AdminRole.OPERATOR };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        {
          provide: AdminUsersRepository,
          useValue: {
            findByUserName: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            insert: jest.fn(),
            updateRole: jest.fn(),
            updatePassword: jest.fn(),
            updateLastLogin: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminUsersService>(AdminUsersService);
    repository = module.get<AdminUsersRepository>(AdminUsersRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create an admin user", async () => {
      jest.spyOn(repository, "findByUserName").mockResolvedValue(null as any);
      jest.spyOn(repository, "insert").mockResolvedValue(mockAdmin as any);

      const result = await service.create({
        username: "test",
        password: "password",
        role: AdminRole.OPERATOR,
      });
      expect(result).toEqual(mockAdmin);
    });

    it("should throw ConflictException if username exists", async () => {
      jest.spyOn(repository, "findByUserName").mockResolvedValue(mockAdmin as any);
      await expect(
        service.create({ username: "test", password: "password", role: AdminRole.OPERATOR }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("updateRole", () => {
    it("should update role", async () => {
      jest.spyOn(repository, "findById").mockResolvedValue(mockAdmin as any);
      jest.spyOn(repository, "updateRole").mockResolvedValue(1 as any);

      await service.updateRole("a-1", AdminRole.DEVELOPER);
      expect(repository.updateRole).toHaveBeenCalledWith("a-1", AdminRole.DEVELOPER);
    });

    it("should throw ForbiddenException for super admin", async () => {
      jest
        .spyOn(repository, "findById")
        .mockResolvedValue({ ...mockAdmin, username: "admin" } as any);
      await expect(service.updateRole("a-1", AdminRole.DEVELOPER)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
