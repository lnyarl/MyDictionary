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
      const listQuery = repository.findByUserId("user-123", 20);
      expect(listQuery.toQuery()).toBe(
        'select "id" as "id", "content" as "content", "word_id" as "wordId", "user_id" as "userId", "is_public" as "isPublic", "tags" as "tags", "media_urls" as "mediaUrls", "created_at" as "createdAt", "updated_at" as "updatedAt", "deleted_at" as "deletedAt" from "definitions" where "definitions"."deleted_at" is null and "user_id" = \'user-123\' order by "created_at" DESC limit 20',
      );
    });

    it("should generate correct query with cursor", () => {
      const listQuery = repository.findByUserId("user-123", 20, "2024-01-01");
      expect(listQuery.toQuery()).toContain("\"created_at\" < '2024-01-01'");
    });
  });

  describe("findById", () => {
    it("should generate correct query", () => {
      const query = repository.findById("def-123");
      expect(query.toQuery()).toBe(
        'select "id" as "id", "content" as "content", "word_id" as "wordId", "user_id" as "userId", "is_public" as "isPublic", "tags" as "tags", "media_urls" as "mediaUrls", "created_at" as "createdAt", "updated_at" as "updatedAt", "deleted_at" as "deletedAt" from "definitions" where "definitions"."deleted_at" is null and "id" = \'def-123\' limit 1',
      );
    });
  });

  describe("findByWordIdAndUserId", () => {
    it("should generate correct query", () => {
      const query = repository.findByWordIdAndUserId("word-123", "user-456");
      expect(query.toQuery()).toBe(
        'select "id" as "id", "content" as "content", "word_id" as "wordId", "user_id" as "userId", "is_public" as "isPublic", "tags" as "tags", "media_urls" as "mediaUrls", "created_at" as "createdAt", "updated_at" as "updatedAt", "deleted_at" as "deletedAt" from "definitions" where "definitions"."deleted_at" is null and "word_id" = \'word-123\' and "user_id" = \'user-456\' order by "created_at" desc',
      );
    });
  });

  describe("findByIdWithPublic", () => {
    it("should generate correct query with joins", () => {
      const query = repository.findByIdWithPublic("def-123");
      const queryStr = query.toQuery();
      expect(queryStr).toBe(
        'select "definitions"."id", "definitions"."word_id" as "wordId", "definitions"."user_id" as "userId", "definitions"."content", "definitions"."tags", "definitions"."media_urls" as "mediaUrls", COUNT(likes.id) as "likesCount", "definitions"."created_at" as "createdAt", "definitions"."updated_at" as "updatedAt", "words"."user_id" as "wordUserId" from "definitions" left join "words" on "words"."id" = "definitions"."word_id" left join "likes" on "likes"."definition_id" = "definitions"."id" where "definitions"."deleted_at" is null and "definitions"."id" = \'def-123\' group by "definitions"."id", "words"."id" limit 1',
      );
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
