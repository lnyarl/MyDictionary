import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Test, type TestingModule } from "@nestjs/testing";
import type { User } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser: User = {
    id: "user-1",
    googleId: "google-1",
    email: "test@example.com",
    nickname: "testuser",
    profilePicture: "https://example.com/pic.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByGoogleId: jest.fn(),
            updateProfile: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
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
            get: jest.fn().mockReturnValue("test-id"),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("validateGoogleUser", () => {
    const googleData = {
      googleId: "google-1",
      email: "test@example.com",
      name: "Test User",
      picture: "https://example.com/pic.jpg",
    };

    it("should update and return existing user", async () => {
      jest.spyOn(usersService, "findByGoogleId").mockResolvedValue(mockUser as any);
      jest.spyOn(usersService, "updateProfile").mockResolvedValue(mockUser as any);
      jest.spyOn(usersService, "findById").mockResolvedValue(mockUser as any);

      const result = await service.validateGoogleUser(googleData);
      expect(result).toEqual(mockUser);
      expect(usersService.updateProfile).toHaveBeenCalled();
    });

    it("should create and return new user", async () => {
      jest.spyOn(usersService, "findByGoogleId").mockResolvedValue(null as any);
      jest.spyOn(usersService, "create").mockResolvedValue(mockUser as any);

      const result = await service.validateGoogleUser(googleData);
      expect(result).toEqual(mockUser);
      expect(usersService.create).toHaveBeenCalled();
    });
  });

  describe("generateJwtToken", () => {
    it("should sign a token", () => {
      const token = service.generateJwtToken(mockUser);
      expect(token).toBe("token");
      expect(jwtService.sign).toHaveBeenCalled();
    });
  });
});
