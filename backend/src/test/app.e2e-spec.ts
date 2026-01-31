import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../app.module";
import { CacheModule } from "../common/cache/cache.module";
import { DatabaseModule } from "../common/database/database.module";
import { TestCacheModule } from "./helper/test-cache.module";
import { TestDatabaseModule } from "./helper/test-database.module";

describe("AppController (e2e)", () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModule)
      .useModule(TestDatabaseModule)
      .overrideModule(CacheModule)
      .useModule(TestCacheModule)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
  it("/ (GET)", () => {
    return request(app.getHttpServer()).get("/").expect(200).expect("Stashy API is running!");
  });

  it("/health (GET)", () => {
    return request(app.getHttpServer())
      .get("/health")
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("status", "ok");
        expect(res.body).toHaveProperty("timestamp");
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
