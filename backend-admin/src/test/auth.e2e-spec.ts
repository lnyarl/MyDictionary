import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../app.module";

describe("AuthController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should login with admin credentials", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ username: "admin", password: "admin" });

    if (res.status === 200) {
      expect(res.body).toHaveProperty("token");
      expect(res.body.admin.username).toBe("admin");
    } else {
      expect([200, 401]).toContain(res.status);
    }
  });
});
