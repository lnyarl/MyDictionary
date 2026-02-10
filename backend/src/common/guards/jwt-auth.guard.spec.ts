import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { JwtAuthGuard } from "./jwt-auth.guard";

jest.mock("@nestjs/passport", () => ({
  AuthGuard: jest.fn(() => {
    return class MockAuthGuard {
      canActivate(context: ExecutionContext) {
        return true;
      }
      handleRequest(err: any, user: any) {
        if (err || !user) {
          throw err || new UnauthorizedException("Invalid token");
        }
        return user;
      }
    };
  }),
}));

describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("canActivate", () => {
    it("should return true for public routes", () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it("should call parent canActivate for non-public routes", () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn(),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe("handleRequest", () => {
    it("should return user when no error and user exists", () => {
      const mockUser = { id: "user-1", email: "test@example.com" };

      const result = guard.handleRequest(null, mockUser, null);

      expect(result).toEqual(mockUser);
    });

    it("should throw UnauthorizedException when user is null", () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(UnauthorizedException);
    });

    it("should throw error when error exists", () => {
      const error = new Error("Test error");

      expect(() => guard.handleRequest(error, null, null)).toThrow(error);
    });
  });
});
