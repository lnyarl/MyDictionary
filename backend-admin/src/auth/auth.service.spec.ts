import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Test, type TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import { AdminUsersService } from "../admin-users/admin-users.service";
import { AdminRole } from "../admin-users/entities/admin-user.entity";
import { DatabaseModule } from "../common/database/database.module";
import { TestDatabaseModule } from "../test/helper/test-database.module";
import { AuthService } from "./auth.service";

jest.mock("bcrypt");

describe("AuthService", () => {
  let service: AuthService;
  let adminUsersService: AdminUsersService;
  let module: TestingModule;
  const mockAdmin = {
    id: "a-1",
    username: "admin",
    password: "hashed_password",
    role: AdminRole.SUPER_ADMIN,
    mustChangePassword: false,
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AdminUsersService,
          useValue: {
            findByUsername: jest.fn(),
            updatePassword: jest.fn(),
            updateLastLogin: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue("token"),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    })
      .overrideModule(DatabaseModule)
      .useModule(TestDatabaseModule)
      .compile();

    service = module.get<AuthService>(AuthService);
    adminUsersService = module.get<AdminUsersService>(AdminUsersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("validateCredentials", () => {
    it("should return admin if credentials are valid", async () => {
      jest
        .spyOn(adminUsersService, "findByUsername")
        .mockResolvedValue(mockAdmin as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateCredentials("admin", "password");
      expect(result).toEqual(mockAdmin);
    });

    it("should return null if credentials are invalid", async () => {
      jest
        .spyOn(adminUsersService, "findByUsername")
        .mockResolvedValue(mockAdmin as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateCredentials("admin", "wrong");
      expect(result).toBeNull();
    });
  });

  describe("generateJwtToken", () => {
    it("should return a token", () => {
      const token = service.generateJwtToken(mockAdmin as any);
      expect(token).toBe("token");
    });
  });
});
