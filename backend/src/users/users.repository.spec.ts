import "reflect-metadata";
import {
  cleanupTestDatabase,
  getTestDatabaseHelper,
  TestDatabaseHelper,
} from "../test/helper/test-database.helper";
import { UsersRepository } from "./users.repository";

describe("UsersRepository", () => {
  let repository: UsersRepository;
  let testDb: TestDatabaseHelper;

  beforeAll(async () => {
    testDb = getTestDatabaseHelper();
    await testDb.setupSchema();
    repository = new UsersRepository(testDb.getKnex());
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe("findById", () => {
    it("should generate correct query", () => {
      const query = repository.findById("user-123");
      expect(query.toQuery()).toBe(
        'select "id" as "id", "google_id" as "googleId", "email" as "email", "nickname" as "nickname", "bio" as "bio", "profile_picture" as "profilePicture", "created_at" as "createdAt", "updated_at" as "updatedAt", "deleted_at" as "deletedAt", "suspended_at" as "suspendedAt" from "users" where "users"."deleted_at" is null and "id" = \'user-123\' limit 1',
      );
    });
  });

  describe("findByGoogleId", () => {
    it("should generate correct query", () => {
      const query = repository.findByGoogleId("google-123");
      expect(query.toQuery()).toBe(
        'select "id" as "id", "google_id" as "googleId", "email" as "email", "nickname" as "nickname", "bio" as "bio", "profile_picture" as "profilePicture", "created_at" as "createdAt", "updated_at" as "updatedAt", "deleted_at" as "deletedAt", "suspended_at" as "suspendedAt" from "users" where "users"."deleted_at" is null and "google_id" = \'google-123\' limit 1',
      );
    });
  });

  describe("findByEmail", () => {
    it("should generate correct query", () => {
      const query = repository.findByEmail("test@example.com");
      expect(query.toQuery()).toBe(
        'select "id" as "id", "google_id" as "googleId", "email" as "email", "nickname" as "nickname", "bio" as "bio", "profile_picture" as "profilePicture", "created_at" as "createdAt", "updated_at" as "updatedAt", "deleted_at" as "deletedAt", "suspended_at" as "suspendedAt" from "users" where "users"."deleted_at" is null and "email" = \'test@example.com\' limit 1',
      );
    });
  });

  describe("findByNickname", () => {
    it("should generate correct query", () => {
      const query = repository.findByNickname("testuser");
      expect(query.toQuery()).toBe(
        'select "id" as "id", "google_id" as "googleId", "email" as "email", "nickname" as "nickname", "bio" as "bio", "profile_picture" as "profilePicture", "created_at" as "createdAt", "updated_at" as "updatedAt", "deleted_at" as "deletedAt", "suspended_at" as "suspendedAt" from "users" where "users"."deleted_at" is null and "nickname" = \'testuser\' limit 1',
      );
    });
  });
});
