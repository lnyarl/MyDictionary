import "reflect-metadata";
import {
  cleanupTestDatabase,
  getTestDatabaseHelper,
  TestDatabaseHelper,
} from "../test/helper/test-database.helper";
import { FollowsRepository } from "./follows.repository";

describe("FollowsRepository", () => {
  let repository: FollowsRepository;
  let testDb: TestDatabaseHelper;

  beforeAll(async () => {
    testDb = getTestDatabaseHelper();
    await testDb.setupSchema();
    repository = new FollowsRepository(testDb.getKnex());
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe("findExistingFollow", () => {
    it("should generate correct query including deleted records", () => {
      const query = repository.findExistingFollow("follower-123", "following-456");
      expect(query.toQuery()).toBe(
        'select "id" as "id", "follower_id" as "followerId", "following_id" as "followingId", "created_at" as "createdAt", "updated_at" as "updatedAt", "deleted_at" as "deletedAt" from "follows" where "follower_id" = \'follower-123\' and "following_id" = \'following-456\' limit 1',
      );
    });
  });

  describe("findById", () => {
    it("should generate correct query", () => {
      const query = repository.findById("follow-123");
      expect(query.toQuery()).toBe(
        'select "id" as "id", "follower_id" as "followerId", "following_id" as "followingId", "created_at" as "createdAt", "updated_at" as "updatedAt", "deleted_at" as "deletedAt" from "follows" where "follows"."deleted_at" is null and "id" = \'follow-123\' limit 1',
      );
    });
  });

  describe("findFollowers", () => {
    it("should generate correct query", () => {
      const listQuery = repository.findFollowers("user-123", 20);
      expect(listQuery.toQuery()).toBe(
        'select "users"."id" as "id", "users"."google_id" as "googleId", "users"."email" as "email", "users"."nickname" as "nickname", "users"."bio" as "bio", "users"."profile_picture" as "profilePicture", "users"."created_at" as "createdAt", "users"."updated_at" as "updatedAt", "users"."deleted_at" as "deletedAt", "users"."suspended_at" as "suspendedAt", "follows"."created_at" as "followCreatedAt" from "follows" left join "users" on "follows"."follower_id" = "users"."id" where "follows"."deleted_at" is null and "following_id" = \'user-123\' order by "follows"."created_at" desc limit 20',
      );
    });
  });

  describe("findFollowings", () => {
    it("should generate correct query", () => {
      const listQuery = repository.findFollowings("user-123", 15);
      expect(listQuery.toQuery()).toBe(
        'select "users"."id" as "id", "users"."google_id" as "googleId", "users"."email" as "email", "users"."nickname" as "nickname", "users"."bio" as "bio", "users"."profile_picture" as "profilePicture", "users"."created_at" as "createdAt", "users"."updated_at" as "updatedAt", "users"."deleted_at" as "deletedAt", "users"."suspended_at" as "suspendedAt", "follows"."created_at" as "followCreatedAt" from "follows" left join "users" on "follows"."following_id" = "users"."id" where "follows"."deleted_at" is null and "follower_id" = \'user-123\' order by "follows"."created_at" desc limit 15',
      );
    });
  });

  describe("getFollowerCount", () => {
    it("should generate correct query", () => {
      const query = repository.getFollowerCount("user-123");
      expect(query.toQuery()).toBe(
        'select count("id") as "count" from "follows" where "follows"."deleted_at" is null and "following_id" = \'user-123\' limit 1',
      );
    });
  });

  describe("getFollowingCount", () => {
    it("should generate correct query", () => {
      const query = repository.getFollowingCount("user-123");
      expect(query.toQuery()).toBe(
        'select count("id") as "count" from "follows" where "follows"."deleted_at" is null and "follower_id" = \'user-123\' limit 1',
      );
    });
  });

  describe("findFollowingIds", () => {
    it("should generate correct query", () => {
      const query = repository.findFollowingIds("user-123");
      const queryStr = query.toQuery();
      expect(queryStr).toBe(
        'select "following_id", "following_id" from "follows" where "follows"."deleted_at" is null and "follower_id" = \'user-123\'',
      );
    });
  });

  describe("findFollowerIds", () => {
    it("should generate correct query", () => {
      const query = repository.findFollowerIds("user-123");
      const queryStr = query.toQuery();
      expect(queryStr).toBe(
        'select "follower_id", "follower_id" from "follows" where "follows"."deleted_at" is null and "following_id" = \'user-123\'',
      );
    });
  });
});
