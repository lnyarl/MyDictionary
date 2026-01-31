import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Test, type TestingModule } from "@nestjs/testing";
import { DefinitionsRepository } from "../definitions/definitions.repository";
import { FollowsRepository } from "../follows/follows.repository";
import { FollowsService } from "../follows/follows.service";
import { NotificationsRepository } from "../notifications/notifications.repository";
import { NotificationsService } from "../notifications/notifications.service";
import {
  cleanupTestDatabase,
  getTestDatabaseHelper,
  TestDatabaseHelper,
} from "../test/helper/test-database.helper";
import { TestDatabaseModule } from "../test/helper/test-database.module";
import { UsersRepository } from "../users/users.repository";
import { UsersService } from "../users/users.service";
import { WordsRepository } from "../words/words.repository";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;
  let testDb: TestDatabaseHelper;
  let module: TestingModule;

  beforeAll(async () => {
    testDb = getTestDatabaseHelper();
    await testDb.setupSchema();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    await testDb.cleanAll();

    module = await Test.createTestingModule({
      imports: [TestDatabaseModule],
      providers: [
        AuthService,
        UsersService,
        UsersRepository,
        WordsRepository,
        DefinitionsRepository,
        FollowsService,
        FollowsRepository,
        NotificationsService,
        NotificationsRepository,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue("test-jwt-token"),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue("test-google-client-id"),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("validateGoogleUser", () => {
    const googleData = {
      googleId: "google-123",
      email: "test@example.com",
      name: "Test User",
      picture: "https://example.com/pic.jpg",
    };

    it("should create a new user if not exists", async () => {
      const result = await service.validateGoogleUser(googleData);

      expect(result.email).toBe("test@example.com");
      expect(result.profilePicture).toBe("https://example.com/pic.jpg");
    });

    it("should update and return existing user", async () => {
      await testDb.createUser({
        googleId: "google-123",
        email: "test@example.com",
        nickname: "existinguser",
        profilePicture: "https://old.com/pic.jpg",
      });

      const result = await service.validateGoogleUser({
        ...googleData,
        picture: "https://new.com/pic.jpg",
      });

      expect(result.profilePicture).toBe("https://new.com/pic.jpg");
    });
  });

  describe("generateJwtToken", () => {
    it("should generate a JWT token", async () => {
      const user = await testDb.createUser({
        email: "jwt@test.com",
        nickname: "jwtuser",
      });

      const token = service.generateJwtToken(user as any);

      expect(token).toBe("test-jwt-token");
    });
  });
});
