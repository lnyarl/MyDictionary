import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Test, type TestingModule } from "@nestjs/testing";
import { JwtAuthGuard } from "./jwt-auth.guard";

describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;
  let module: TestingModule;
  beforeEach(async () => {
    module = await Test.createTestingModule({
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

  it("should return true if public", () => {
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);

    expect(guard.canActivate(context)).toBe(true);
  });
});
