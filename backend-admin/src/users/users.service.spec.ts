import { ConflictException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { PaginationDto } from "@shared";
import { DatabaseModule } from "../common/database/database.module";
import { TestDatabaseModule } from "../test/helper/test-database.module";
import { UsersRepository } from "./users.repository";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  let service: UsersService;
  let repository: UsersRepository;
  let module: TestingModule;
  const mockUser = {
    id: "u-1",
    email: "test@example.com",
    nickname: "testuser",
    googleId: null,
    profilePicture: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findUsers: jest.fn(),
            findByEmail: jest.fn(),
            findByNickname: jest.fn(),
            insert: jest.fn(),
          },
        },
      ],
    })
      .overrideModule(DatabaseModule)
      .useModule(TestDatabaseModule)
      .compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });
  afterEach(async () => {
    await module?.close();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getUsers", () => {
    it("should return paginated users", async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10, offset: 0 };
      jest.spyOn(repository, "findUsers" as any).mockResolvedValue({
        listQuery: Promise.resolve([mockUser]),
        countQuery: Promise.resolve({ count: 1 }),
      } as any);

      const result = await service.getUsers(paginationDto);
      expect(result.data).toEqual([mockUser]);
      expect(result.meta.total).toBe(1);
    });
  });

  describe("createUser", () => {
    it("should create a user", async () => {
      jest.spyOn(repository, "findByEmail").mockResolvedValue(null as any);
      jest.spyOn(repository, "findByNickname").mockResolvedValue(null as any);
      jest
        .spyOn(repository, "insert" as any)
        .mockResolvedValue(mockUser as any);

      const result = await service.createUser({
        email: "test@example.com",
        nickname: "testuser",
      });
      expect(result).toEqual(mockUser);
    });

    it("should throw ConflictException if email registered", async () => {
      jest.spyOn(repository, "findByEmail").mockResolvedValue(mockUser as any);
      await expect(
        service.createUser({ email: "test@example.com", nickname: "testuser" }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
