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
        'select "definitions"."id" as "id", "content" as "content", "word_id" as "wordId", "term_id" as "termId", "definitions"."user_id" as "userId", "definitions"."is_public" as "isPublic", "tags" as "tags", "media_urls" as "mediaUrls", "definitions"."created_at" as "createdAt", "definitions"."updated_at" as "updatedAt", "definitions"."deleted_at" as "deletedAt" from "definitions" where "definitions"."deleted_at" is null and "user_id" = \'user-123\' order by "created_at" DESC limit 20',
      );
    });

    it("should generate correct query with cursor", () => {
      const listQuery = repository.findByUserId(
        "user-123",
        20,
        new Date("2024-01-01").getTime().toString(),
      );
      expect(listQuery.toQuery()).toBe(
        'select "definitions"."id" as "id", "content" as "content", "word_id" as "wordId", "term_id" as "termId", "definitions"."user_id" as "userId", "definitions"."is_public" as "isPublic", "tags" as "tags", "media_urls" as "mediaUrls", "definitions"."created_at" as "createdAt", "definitions"."updated_at" as "updatedAt", "definitions"."deleted_at" as "deletedAt" from "definitions" where "definitions"."deleted_at" is null and "user_id" = \'user-123\' and "created_at" < \'2024-01-01 09:00:00.000\' order by "created_at" DESC limit 20',
      );
    });
  });

  describe("findById", () => {
    it("should generate correct query", () => {
      const query = repository.findById("def-123");
      expect(query.toQuery()).toBe(
        'select "definitions"."id" as "id", "content" as "content", "word_id" as "wordId", "term_id" as "termId", "definitions"."user_id" as "userId", "definitions"."is_public" as "isPublic", "tags" as "tags", "media_urls" as "mediaUrls", "definitions"."created_at" as "createdAt", "definitions"."updated_at" as "updatedAt", "definitions"."deleted_at" as "deletedAt" from "definitions" where "definitions"."deleted_at" is null and "id" = \'def-123\' limit 1',
      );
    });
  });

  describe("findByWordIdAndUserId", () => {
    it("should generate correct query", () => {
      const query = repository.findByWordIdAndUserId("word-123", "user-456");
      expect(query.toQuery()).toBe(
        'select "definitions"."id" as "id", "content" as "content", "word_id" as "wordId", "term_id" as "termId", "definitions"."user_id" as "userId", "definitions"."is_public" as "isPublic", "tags" as "tags", "media_urls" as "mediaUrls", "definitions"."created_at" as "createdAt", "definitions"."updated_at" as "updatedAt", "definitions"."deleted_at" as "deletedAt" from "definitions" where "definitions"."deleted_at" is null and "word_id" = \'word-123\' and "user_id" = \'user-456\' order by "created_at" desc',
      );
    });
  });

  describe("findByIdWithPublic", () => {
    it("should generate correct query with joins", () => {
      const query = repository.findByIdWithPublic("def-123");
      const queryStr = query.toQuery();
      expect(queryStr).toBe(
        'select "definitions"."id" as "id", "definitions"."word_id" as "wordId", "words"."term" as "term", "definitions"."term_id" as "termId", "definitions"."user_id" as "userId", "definitions"."content" as "content", "definitions"."tags" as "tags", "definitions"."is_public" as "isPublic", "definitions"."media_urls" as "mediaUrls", "definitions"."created_at" as "createdAt", "definitions"."updated_at" as "updatedAt", "words"."user_id" as "wordUserId", "users"."nickname" as "nickname", "users"."profile_picture" as "profilePicture" from "definitions" left join "words" on "words"."id" = "definitions"."word_id" left join "users" on "users"."id" = "definitions"."user_id" where "definitions"."deleted_at" is null and "definitions"."id" = \'def-123\' group by "definitions"."id", "words"."id", "users"."id" limit 1',
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
