import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { uuidv7 } from "uuidv7";
import { AppModule } from "./../app.module";

describe("WordsController (e2e)", () => {
  let app: INestApplication;
  let cookie: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    const loginRes = await request(app.getHttpServer())
      .post("/auth/mock-login")
      .send({ email: `words-${uuidv7()}@example.com` })
      .expect(200);

    cookie = loginRes.header["set-cookie"];
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create a word", async () => {
    const wordData = {
      term: "testword",
      language: "en",
      isPublic: true,
    };

    const res = await request(app.getHttpServer())
      .post("/words")
      .set("Cookie", cookie)
      .send(wordData)
      .expect(201);

    expect(res.body).toHaveProperty("id");
    expect(res.body.term).toBe(wordData.term);
  });

  it("should get all words for user", async () => {
    const res = await request(app.getHttpServer()).get("/words").set("Cookie", cookie).expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should search for words", async () => {
    const res = await request(app.getHttpServer()).get("/words/search?term=test").expect(200);

    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
