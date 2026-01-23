import "reflect-metadata";
import {
  cleanupTestDatabase,
  getTestDatabaseHelper,
  TestDatabaseHelper,
} from "../test/helper/test-database.helper";
import { WordsRepository } from "./words.repository";

describe("WordsRepository", () => {
  let repository: WordsRepository;
  let testDb: TestDatabaseHelper;

  beforeAll(async () => {
    testDb = getTestDatabaseHelper();
    await testDb.setupSchema();
    repository = new WordsRepository(testDb.getKnex());
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe("findByUserId", () => {
    it("should generate correct query", () => {
      const query = repository.findByUserId("user-123");
      expect(query.toQuery()).toBe(
        'select "id" as "id", "term" as "term", "user_id" as "userId", "is_public" as "isPublic", "created_at" as "createdAt", "updated_at" as "updatedAt", "deleted_at" as "deletedAt" from "words" where "words"."deleted_at" is null and "user_id" = \'user-123\' order by "created_at" desc',
      );
    });
  });

  describe("findPublicByUserId", () => {
    it("should generate correct query", () => {
      const { listQuery, countQuery } = repository.findPublicByUserId("user-123", 10, 5);
      expect(listQuery.toQuery()).toBe(
        'select "id" as "id", "term" as "term", "user_id" as "userId", "is_public" as "isPublic", "created_at" as "createdAt", "updated_at" as "updatedAt", "deleted_at" as "deletedAt" from "words" where "words"."deleted_at" is null and "user_id" = \'user-123\' and "is_public" = true order by "created_at" desc limit 10 offset 5',
      );
      expect(countQuery.toQuery()).toBe(
        'select count(*) as "count" from "words" where "words"."deleted_at" is null and "user_id" = \'user-123\' and "is_public" = true limit 1',
      );
    });
  });

  describe("countPublicByUserId", () => {
    it("should generate correct query", () => {
      const query = repository.countPublicByUserId("user-123");
      expect(query.toQuery()).toBe(
        'select count(*) as "count" from "words" where "words"."deleted_at" is null and "user_id" = \'user-123\' and "is_public" = true limit 1',
      );
    });
  });

  describe("findById", () => {
    it("should generate correct query", () => {
      const query = repository.findById("word-123");
      expect(query.toQuery()).toBe(
        'select "id" as "id", "term" as "term", "user_id" as "userId", "is_public" as "isPublic", "created_at" as "createdAt", "updated_at" as "updatedAt", "deleted_at" as "deletedAt" from "words" where "words"."deleted_at" is null and "id" = \'word-123\' limit 1',
      );
    });
  });

  describe("searchWithDefinitions", () => {
    it("should generate correct query without userId", () => {
      const { listQuery, countQuery } = repository.searchWithDefinitions("test", undefined, 10, 0);
      expect(countQuery.toQuery()).toBe("words");
      expect(listQuery.toQuery()).toBe("definitions");
    });

    it("should generate correct query with userId", () => {
      const { listQuery, countQuery } = repository.searchWithDefinitions("test", "user-123", 10, 0);
      expect(countQuery.toQuery()).toBe("user_id");
      expect(listQuery.toQuery()).toBe("user-123");
    });
  });
});
