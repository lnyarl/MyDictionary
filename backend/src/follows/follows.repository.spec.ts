import "reflect-metadata";
import {
  cleanupTestDatabase,
  getTestDatabaseHelper,
  TestDatabaseHelper,
} from "../common/database/test-database.helper";
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
      expect((query as any).toQuery()).toBe(
        'select "id" as "id", "follower_id" as "followerId", "following_id" as "followingId", "created_at" as "createdAt", "updated_at" as "updatedAt", "deleted_at" as "deletedAt" from "follows" where "follower_id" = \'follower-123\' and "following_id" = \'following-456\' limit 1',
      );
    });
  });

  describe("findById", () => {
    it("should generate correct query", () => {
      const query = repository.findById("follow-123");
      expect((query as any).toQuery()).toBe(
        'select "id" as "id", "follower_id" as "followerId", "following_id" as "followingId", "created_at" as "createdAt", "updated_at" as "updatedAt", "deleted_at" as "deletedAt" from "follows" where "follows"."deleted_at" is null and "id" = \'follow-123\' limit 1',
      );
    });
  });

  describe("findFollowers", () => {
    it("should generate correct query with pagination", () => {
      const { listQuery, countQuery } = repository.findFollowers("user-123", 10, 20);
      expect(listQuery.toQuery()).toContain("follows");
      expect(listQuery.toQuery()).toContain("users");
      expect(listQuery.toQuery()).toContain("follower_id");
      expect(listQuery.toQuery()).toContain("limit 20");
      expect(listQuery.toQuery()).toContain("offset 10");
      expect(countQuery.toQuery()).toContain("count");
    });
  });

  describe("findFollowings", () => {
    it("should generate correct query with pagination", () => {
      const { listQuery, countQuery } = repository.findFollowings("user-123", 5, 15);
      expect(listQuery.toQuery()).toContain("follows");
      expect(listQuery.toQuery()).toContain("users");
      expect(listQuery.toQuery()).toContain("following_id");
      expect(listQuery.toQuery()).toContain("limit 15");
      expect(listQuery.toQuery()).toContain("offset 5");
      expect(countQuery.toQuery()).toContain("count");
    });
  });

  describe("getFollowerCount", () => {
    it("should generate correct query", () => {
      const query = repository.getFollowerCount("user-123");
      expect((query as any).toQuery()).toBe(
        'select count("id") as "count" from "follows" where "follows"."deleted_at" is null and "following_id" = \'user-123\' limit 1',
      );
    });
  });

  describe("getFollowingCount", () => {
    it("should generate correct query", () => {
      const query = repository.getFollowingCount("user-123");
      expect((query as any).toQuery()).toBe(
        'select count("id") as "count" from "follows" where "follows"."deleted_at" is null and "follower_id" = \'user-123\' limit 1',
      );
    });
  });

  describe("findFollowingIds", () => {
    it("should generate correct query", () => {
      const query = repository.findFollowingIds("user-123");
      const queryStr = (query as any).toQuery();
      expect(queryStr).toContain("following_id");
      expect(queryStr).toContain("follower_id");
      expect(queryStr).toContain("user-123");
    });
  });

  describe("findFollowerIds", () => {
    it("should generate correct query", () => {
      const query = repository.findFollowerIds("user-123");
      const queryStr = (query as any).toQuery();
      expect(queryStr).toContain("follower_id");
      expect(queryStr).toContain("following_id");
      expect(queryStr).toContain("user-123");
    });
  });
});
