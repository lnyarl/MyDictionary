import { type INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { uuidv7 } from "uuidv7";
import { AppModule } from "./../src/app.module";

describe("Follows & Likes (e2e)", () => {
  let app: INestApplication;
  let cookie: string;
  let otherUserId: string;
  let definitionId: string;

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
      .send({ email: `inter-1-${uuidv7()}@example.com` })
      .expect(200);
    cookie = loginRes.header["set-cookie"];

    const _userRes = await request(app.getHttpServer())
      .get("/auth/me")
      .set("Cookie", cookie)
      .expect(200);

    const otherUserRes = await request(app.getHttpServer())
      .post("/auth/mock-login")
      .send({ email: `inter-2-${uuidv7()}@example.com` })
      .expect(200);
    otherUserId = otherUserRes.body.user.id;
    const otherCookie = otherUserRes.header["set-cookie"];

    const wordRes = await request(app.getHttpServer())
      .post("/words")
      .set("Cookie", otherCookie)
      .send({ term: "like-test", isPublic: true })
      .expect(201);

    const defRes = await request(app.getHttpServer())
      .post("/definitions")
      .set("Cookie", otherCookie)
      .send({ wordId: wordRes.body.id, content: "Like this" })
      .expect(201);
    definitionId = defRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it("should follow a user", async () => {
    await request(app.getHttpServer())
      .post(`/follows/${otherUserId}`)
      .set("Cookie", cookie)
      .expect(201);
  });

  it("should like a definition", async () => {
    const res = await request(app.getHttpServer())
      .post(`/likes/${definitionId}`)
      .set("Cookie", cookie)
      .expect(201);

    expect(res.body).toEqual({ liked: true });
  });
});
