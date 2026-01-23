import "reflect-metadata";
import {
  cleanupTestDatabase,
  getTestDatabaseHelper,
  TestDatabaseHelper,
} from "../test/helper/test-database.helper";
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
      const queryStr = query.toQuery();
      expect(queryStr).toBe("");
    });

    it("should order by created_at desc", () => {
      const query = repository.findFeeds(["user-1"], 0, 10);
      const queryStr = query.toQuery();
      expect(queryStr).toBe("");
    });
  });

  describe("findRecommendations", () => {
    it("should generate correct query without exclude user", () => {
      const query = repository.findRecommendations(0, 20);
      const queryStr = query.toQuery();
      expect(queryStr).toBe("");
    });

    it("should generate correct query with exclude user", () => {
      const query = repository.findRecommendations(0, 20, "exclude-user");
      const queryStr = query.toQuery();
      expect(queryStr).toBe("");
    });

    it("should order by likes_count and created_at desc", () => {
      const query = repository.findRecommendations(5, 15);
      const queryStr = query.toQuery();
      expect(queryStr).toBe("");
    });
  });
});
