import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { OAuth2Client } from "google-auth-library";
import { User } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";
import { AuthService, GoogleUserData } from "./auth.service";
import { RefreshTokenRepository } from "./repositories/refresh-token.repository";

jest.mock("google-auth-library");

describe("AuthService", () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let refreshTokenRepository: RefreshTokenRepository;
  let mockOAuth2Client: jest.Mocked<OAuth2Client>;

  const mockUser: User = {
    id: "user-1",
    email: "test@example.com",
    nickname: "testuser",
    profilePicture: "https://example.com/pic.jpg",
    googleId: "google-123",
    bio: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    suspendedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByGoogleId: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            updateProfile: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue("test-jwt-token"),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                GOOGLE_CLIENT_ID: "test-google-client-id",
                JWT_REFRESH_EXPIRES_IN: "30d",
                REFRESH_TOKEN_EXTENSION_THRESHOLD_DAYS: "3",
              };
              return config[key];
            }),
          },
        },
        {
          provide: RefreshTokenRepository,
          useValue: {
            create: jest.fn(),
            findByToken: jest.fn(),
            deleteById: jest.fn(),
            deleteByToken: jest.fn(),
            deleteByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    refreshTokenRepository = module.get<RefreshTokenRepository>(RefreshTokenRepository);

    mockOAuth2Client = new OAuth2Client() as jest.Mocked<OAuth2Client>;
    (OAuth2Client as jest.MockedClass<typeof OAuth2Client>).mockImplementation(
      () => mockOAuth2Client,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("validateGoogleUser", () => {
    const googleData: GoogleUserData = {
      googleId: "google-123",
      email: "test@example.com",
      name: "Test User",
      picture: "https://example.com/pic.jpg",
    };

    it("should create a new user if not exists", async () => {
      jest.spyOn(usersService, "findByGoogleId").mockResolvedValue(undefined);
      jest.spyOn(usersService, "create").mockResolvedValue(mockUser);

      const result = await service.validateGoogleUser(googleData);

      expect(usersService.create).toHaveBeenCalledWith({
        googleId: googleData.googleId,
        email: googleData.email,
        nickname: expect.any(String),
        profilePicture: googleData.picture,
      });
      expect(result).toEqual(mockUser);
    });

    it("should update and return existing user if profile picture is missing", async () => {
      const existingUser = { ...mockUser, profilePicture: null };
      jest.spyOn(usersService, "findByGoogleId").mockResolvedValue(existingUser);
      jest.spyOn(usersService, "updateProfile").mockResolvedValue({ ...mockUser });
      jest.spyOn(usersService, "findById").mockResolvedValue(mockUser);

      const result = await service.validateGoogleUser({
        ...googleData,
        picture: "https://new.com/pic.jpg",
      });

      expect(usersService.updateProfile).toHaveBeenCalledWith(existingUser.id, {
        profilePicture: "https://new.com/pic.jpg",
      });
      expect(result).toEqual(mockUser);
    });

    it("should return existing user without update if profile picture exists", async () => {
      jest.spyOn(usersService, "findByGoogleId").mockResolvedValue(mockUser);
      jest.spyOn(usersService, "findById").mockResolvedValue(mockUser);

      const result = await service.validateGoogleUser(googleData);

      expect(usersService.updateProfile).not.toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe("verifyGoogleToken", () => {
    it("should verify Google token and return user data", async () => {
      const mockPayload = {
        sub: "google-123",
        email: "test@example.com",
        name: "Test User",
        picture: "https://example.com/pic.jpg",
      };

      mockOAuth2Client.verifyIdToken = jest.fn().mockResolvedValue({
        getPayload: () => mockPayload,
      } as any);

      const result = await service.verifyGoogleToken("valid-token");

      expect(result).toEqual({
        googleId: "google-123",
        email: "test@example.com",
        name: "Test User",
        picture: "https://example.com/pic.jpg",
      });
    });

    it("should throw UnauthorizedException for invalid token", async () => {
      mockOAuth2Client.verifyIdToken = jest.fn().mockRejectedValue(new Error("Invalid token"));

      await expect(service.verifyGoogleToken("invalid-token")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if payload is null", async () => {
      mockOAuth2Client.verifyIdToken = jest.fn().mockResolvedValue({
        getPayload: () => null,
      } as any);

      await expect(service.verifyGoogleToken("valid-token")).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("generateJwtToken", () => {
    it("should generate a JWT token", () => {
      const token = service.generateJwtToken(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(token).toBe("test-jwt-token");
    });
  });

  describe("generateTokenPair", () => {
    it("should generate access and refresh tokens", async () => {
      jest.spyOn(refreshTokenRepository, "create").mockResolvedValue(undefined as any);

      const result = await service.generateTokenPair(mockUser);

      expect(result.accessToken).toBe("test-jwt-token");
      expect(result.refreshToken).toBeDefined();
      expect(typeof result.refreshToken).toBe("string");
      expect(refreshTokenRepository.create).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(String),
        expect.any(Date),
        false,
      );
    });

    it("should generate admin token pair with shorter expiration", async () => {
      jest.spyOn(refreshTokenRepository, "create").mockResolvedValue(undefined as any);

      await service.generateTokenPair(mockUser, true);

      expect(refreshTokenRepository.create).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(String),
        expect.any(Date),
        true,
      );
    });
  });

  describe("refreshAccessToken", () => {
    it("should refresh access token with valid refresh token", async () => {
      const storedToken = {
        id: "token-1",
        userId: mockUser.id,
        token: "valid-refresh-token",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        fromAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest.spyOn(refreshTokenRepository, "findByToken").mockResolvedValue(storedToken);
      jest.spyOn(usersService, "findById").mockResolvedValue(mockUser);
      jest.spyOn(refreshTokenRepository, "deleteById").mockResolvedValue(undefined);
      jest.spyOn(refreshTokenRepository, "create").mockResolvedValue(undefined as any);

      const result = await service.refreshAccessToken("valid-refresh-token");

      expect(result.accessToken).toBe("test-jwt-token");
      expect(result.user).toEqual(mockUser);
      expect(result.refreshToken).toBeDefined();
    });

    it("should throw UnauthorizedException for invalid refresh token", async () => {
      jest.spyOn(refreshTokenRepository, "findByToken").mockResolvedValue(null);

      await expect(service.refreshAccessToken("invalid-token")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException if user not found", async () => {
      const storedToken = {
        id: "token-1",
        userId: "non-existent",
        token: "valid-refresh-token",
        expiresAt: new Date(),
        fromAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest.spyOn(refreshTokenRepository, "findByToken").mockResolvedValue(storedToken);
      jest.spyOn(usersService, "findById").mockResolvedValue(null);

      await expect(service.refreshAccessToken("valid-refresh-token")).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe("revokeRefreshToken", () => {
    it("should delete refresh token by token string", async () => {
      jest.spyOn(refreshTokenRepository, "deleteByToken").mockResolvedValue(undefined);

      await service.revokeRefreshToken("refresh-token");

      expect(refreshTokenRepository.deleteByToken).toHaveBeenCalledWith("refresh-token");
    });
  });

  describe("revokeAllUserRefreshTokens", () => {
    it("should delete all refresh tokens for user", async () => {
      jest.spyOn(refreshTokenRepository, "deleteByUserId").mockResolvedValue(undefined);

      await service.revokeAllUserRefreshTokens("user-1");

      expect(refreshTokenRepository.deleteByUserId).toHaveBeenCalledWith("user-1");
    });
  });

  describe("verifyJwtToken", () => {
    it("should return payload for valid token", () => {
      const mockPayload = { sub: "user-1", email: "test@example.com" };
      jest.spyOn(jwtService, "verify").mockReturnValue(mockPayload);

      const result = service.verifyJwtToken("valid-token");

      expect(result).toEqual(mockPayload);
    });

    it("should return null for invalid token", () => {
      jest.spyOn(jwtService, "verify").mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const result = service.verifyJwtToken("invalid-token");

      expect(result).toBeNull();
    });
  });

  describe("findUserById", () => {
    it("should return user by id", async () => {
      jest.spyOn(usersService, "findById").mockResolvedValue(mockUser);

      const result = await service.findUserById("user-1");

      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      jest.spyOn(usersService, "findById").mockResolvedValue(null);

      const result = await service.findUserById("non-existent");

      expect(result).toBeNull();
    });
  });
});
