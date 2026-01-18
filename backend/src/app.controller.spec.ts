import { Test, type TestingModule } from "@nestjs/testing";
import { I18nService } from "nestjs-i18n";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: I18nService,
          useValue: { t: (key: string) => key },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("root", () => {
    it('should return "Stashy API is running!"', () => {
      expect(appController.getHello()).toBe("Stashy API is running!");
    });
  });

  describe("health", () => {
    it("should return health status", () => {
      const result = appController.getHealth();
      expect(result).toHaveProperty("status", "ok");
      expect(result).toHaveProperty("timestamp");
    });
  });
});
