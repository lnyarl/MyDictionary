import "reflect-metadata";
import {
  cleanupTestDatabase,
  getTestDatabaseHelper,
  TestDatabaseHelper,
} from "../test/helper/test-database.helper";
import { DefinitionsRepository } from "./definitions.repository";

describe("DefinitionsRepository", () => {
  let repository: DefinitionsRepository;
  let testDb: TestDatabaseHelper;

  beforeAll(async () => {
    testDb = getTestDatabaseHelper();
    await testDb.setupSchema();
    repository = new DefinitionsRepository(testDb.getKnex());
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe("findByUserId", () => {
    it("should generate correct query", () => {
      const { listQuery, countQuery } = repository.findByUserId("user-123", 10, 20);
      expect(listQuery.toQuery()).toBe(
        'select "id" as "id", "content" as "content", "word_id" as "wordId", "user_id" as "userId", "tags" as "tags", "media_urls" as "mediaUrls", "created_at" as "createdAt", "updated_at" as "updatedAt", "deleted_at" as "deletedAt" from "definitions" where "definitions"."deleted_at" is null and "user_id" = \'user-123\' order by "created_at" DESC limit 20 offset 10',
      );
      expect(countQuery.toQuery()).toBe(
        'select count(*) as "count" from "definitions" where "definitions"."deleted_at" is null and "user_id" = \'user-123\' limit 1',
      );
    });
  });

  describe("findById", () => {
    it("should generate correct query", () => {
      const query = repository.findById("def-123");
      expect(query.toQuery()).toBe(
        'select "id" as "id", "content" as "content", "word_id" as "wordId", "user_id" as "userId", "tags" as "tags", "media_urls" as "mediaUrls", "created_at" as "createdAt", "updated_at" as "updatedAt", "deleted_at" as "deletedAt" from "definitions" where "definitions"."deleted_at" is null and "id" = \'def-123\' limit 1',
      );
    });
  });

  describe("findByWordIdAndUserId", () => {
    it("should generate correct query", () => {
      const query = repository.findByWordIdAndUserId("word-123", "user-456");
      expect(query.toQuery()).toBe(
        'select "id" as "id", "content" as "content", "word_id" as "wordId", "user_id" as "userId", "tags" as "tags", "media_urls" as "mediaUrls", "created_at" as "createdAt", "updated_at" as "updatedAt", "deleted_at" as "deletedAt" from "definitions" where "definitions"."deleted_at" is null and "word_id" = \'word-123\' and "user_id" = \'user-456\' order by "created_at" desc',
      );
    });
  });

  describe("findByIdWithPublic", () => {
    it("should generate correct query with joins", () => {
      const query = repository.findByIdWithPublic("def-123");
      const queryStr = query.toQuery();
      expect(queryStr).toBe("");
    });
  });

  describe("getCountByUserId", () => {
    it("should generate correct query", () => {
      const query = repository.getCountByUserId("user-123");
      expect(query.toQuery()).toBe(
        'select count(*) as "count" from "definitions" where "definitions"."deleted_at" is null and "user_id" = \'user-123\' limit 1',
      );
    });
  });
});
