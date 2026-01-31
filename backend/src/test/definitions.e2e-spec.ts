import { type INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { uuidv7 } from "uuidv7";
import { AppModule } from "./../app.module";
import { CacheModule } from "../common/cache/cache.module";
import { DatabaseModule } from "../common/database/database.module";
import { TestCacheModule } from "./helper/test-cache.module";
import { TestDatabaseModule } from "./helper/test-database.module";

describe("DefinitionsController (e2e)", () => {
  let app: INestApplication;
  let cookie: string;
  let wordId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModule)
      .useModule(TestDatabaseModule)
      .overrideModule(CacheModule)
      .useModule(TestCacheModule)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    const loginRes = await request(app.getHttpServer())
      .post("/auth/mock-login")
      .send({ email: `defs-${uuidv7()}@example.com` })
      .expect(200);
    cookie = loginRes.header["set-cookie"];

    const wordRes = await request(app.getHttpServer())
      .post("/words")
      .set("Cookie", cookie)
      .send({ term: "def-test", isPublic: true })
      .expect(201);
    wordId = wordRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create a definition", async () => {
    const res = await request(app.getHttpServer())
      .post("/definitions")
      .set("Cookie", cookie)
      .send({ wordId, content: "This is a test definition" })
      .expect(201);

    expect(res.body).toHaveProperty("id");
    expect(res.body.content).toBe("This is a test definition");
  });

  it("should get definitions for a word", async () => {
    const res = await request(app.getHttpServer()).get(`/words/${wordId}/definitions`).expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
