import "reflect-metadata";
import {
  cleanupTestDatabase,
  getTestDatabaseHelper,
  TestDatabaseHelper,
} from "../common/database/test-database.helper";
import { FeedRepository } from "./feed.repository";

describe("FeedRepository", () => {
  let repository: FeedRepository;
  let testDb: TestDatabaseHelper;

  beforeAll(async () => {
    testDb = getTestDatabaseHelper();
    await testDb.setupSchema();
    repository = new FeedRepository(testDb.getKnex());
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe("findFeeds", () => {
    it("should generate correct query with user IDs filter", () => {
      const query = repository.findFeeds(["user-1", "user-2"], 0, 10);
      const queryStr = (query as any).toQuery();
      expect(queryStr).toContain("vw_definitions_with_likes");
      expect(queryStr).toContain("users");
      expect(queryStr).toContain("words");
      expect(queryStr).toContain("user-1");
      expect(queryStr).toContain("user-2");
      expect(queryStr).toContain("is_public");
      expect(queryStr).toContain("limit 10");
    });

    it("should order by created_at desc", () => {
      const query = repository.findFeeds(["user-1"], 0, 10);
      const queryStr = (query as any).toQuery();
      expect(queryStr).toContain("order by");
      expect(queryStr).toContain("created_at");
      expect(queryStr).toContain("desc");
    });
  });

  describe("findRecommendations", () => {
    it("should generate correct query without exclude user", () => {
      const query = repository.findRecommendations(0, 20);
      const queryStr = (query as any).toQuery();
      expect(queryStr).toContain("vw_definitions_with_likes");
      expect(queryStr).toContain("users");
      expect(queryStr).toContain("words");
      expect(queryStr).toContain("is_public");
      expect(queryStr).toContain("limit 20");
      expect(queryStr).toContain("likes_count");
    });

    it("should generate correct query with exclude user", () => {
      const query = repository.findRecommendations(0, 20, "exclude-user");
      const queryStr = (query as any).toQuery();
      expect(queryStr).toContain("exclude-user");
      expect(queryStr).toContain("user_id");
    });

    it("should order by likes_count and created_at desc", () => {
      const query = repository.findRecommendations(5, 15);
      const queryStr = (query as any).toQuery();
      expect(queryStr).toContain("order by");
      expect(queryStr).toContain("likes_count");
    });
  });
});
