import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../app.module";
import { DatabaseModule } from "../common/database/database.module";
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
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("/ (GET)", () => {
    return request(app.getHttpServer())
      .get("/")
      .expect(200)
      .expect("Stashy Admin API");
  });

  afterAll(async () => {
    await app.close();
  });
});
