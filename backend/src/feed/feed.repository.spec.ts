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
      const listQuery = repository.findFeeds(["user-1", "user-2"], 10);
      expect(listQuery.toQuery()).toBe(
        'select "definitions"."id" as "id", "definitions"."content" as "content", "definitions"."word_id" as "wordId", "definitions"."user_id" as "userId", "definitions"."created_at" as "createdAt", "definitions"."updated_at" as "updatedAt", "users"."nickname" as "nickname", "users"."profile_picture" as "profilePicture", "definitions"."tags" as "tags", "words"."term" as "term", "terms"."number" as "termNumber" from "definitions" left join "users" on "definitions"."user_id" = "users"."id" left join "words" on "definitions"."word_id" = "words"."id" left join "terms" on "words"."term" = "terms"."text" where "definitions"."deleted_at" is null and "definitions"."user_id" in (\'user-1\', \'user-2\') and "words"."deleted_at" is null and "definitions"."is_public" = true order by "definitions"."created_at" desc limit 10',
      );
    });

    it("should generate correct query with cursor", () => {
      const listQuery = repository.findFeeds(
        ["user-1"],
        10,
        new Date("2024-01-01").getTime().toString(),
      );
      expect(listQuery.toQuery()).toBe(
        'select "definitions"."id" as "id", "definitions"."content" as "content", "definitions"."word_id" as "wordId", "definitions"."user_id" as "userId", "definitions"."created_at" as "createdAt", "definitions"."updated_at" as "updatedAt", "users"."nickname" as "nickname", "users"."profile_picture" as "profilePicture", "definitions"."tags" as "tags", "words"."term" as "term", "terms"."number" as "termNumber" from "definitions" left join "users" on "definitions"."user_id" = "users"."id" left join "words" on "definitions"."word_id" = "words"."id" left join "terms" on "words"."term" = "terms"."text" where "definitions"."deleted_at" is null and "definitions"."user_id" in (\'user-1\') and "words"."deleted_at" is null and "definitions"."is_public" = true and "definitions"."created_at" < \'2024-01-01 09:00:00.000\' order by "definitions"."created_at" desc limit 10',
      );
    });
  });

  describe("findAllFeeds", () => {
    it("all feeds with cursor", () => {
      const feed = repository.findAllFeeds(
        "userId",
        15,
        new Date("2026-01-27T12:48:19").getTime().toString(),
      );
      expect(feed.toQuery()).toBe(
        'select "definitions"."id" as "id", "definitions"."content" as "content", "definitions"."word_id" as "wordId", "definitions"."user_id" as "userId", "definitions"."created_at" as "createdAt", "definitions"."updated_at" as "updatedAt", "users"."nickname" as "nickname", "users"."profile_picture" as "profilePicture", "words"."term" as "term", "definitions"."tags" as "tags", "terms"."number" as "termNumber" from "definitions" left join "users" on "definitions"."user_id" = "users"."id" left join "words" on "definitions"."word_id" = "words"."id" left join "terms" on "words"."term" = "terms"."text" where "definitions"."deleted_at" is null and "words"."deleted_at" is null and "definitions"."is_public" = true and "definitions"."created_at" < \'2026-01-27 12:48:19.000\' order by "definitions"."created_at" desc limit 15',
      );
    });
  });

  describe("findRecommendations", () => {
    it("should generate correct query without exclude user", () => {
      const query = repository.findRecommendations(20);
      const queryStr = query.toQuery();
      expect(queryStr).toBe(
        'select "definitions"."id" as "id", "definitions"."content" as "content", "definitions"."word_id" as "wordId", "definitions"."user_id" as "userId", "definitions"."created_at" as "createdAt", "definitions"."updated_at" as "updatedAt", "users"."nickname" as "nickname", "users"."profile_picture" as "profilePicture", "words"."term" as "term", "terms"."number" as "termNumber" from "vw_definitions_with_likes" as "definitions" left join "users" on "definitions"."user_id" = "users"."id" left join "words" on "definitions"."word_id" = "words"."id" left join "terms" on "words"."term" = "terms"."text" where "definitions"."deleted_at" is null and "words"."deleted_at" is null and "users"."deleted_at" is null and "definitions"."is_public" = true order by "definitions"."likes_count" desc, "definitions"."created_at" desc limit 20',
      );
    });

    it("should generate correct query with exclude user", () => {
      const query = repository.findRecommendations(20, undefined, "exclude-user");
      const queryStr = query.toQuery();
      expect(queryStr).toBe(
        'select "definitions"."id" as "id", "definitions"."content" as "content", "definitions"."word_id" as "wordId", "definitions"."user_id" as "userId", "definitions"."created_at" as "createdAt", "definitions"."updated_at" as "updatedAt", "users"."nickname" as "nickname", "users"."profile_picture" as "profilePicture", "words"."term" as "term", "terms"."number" as "termNumber" from "vw_definitions_with_likes" as "definitions" left join "users" on "definitions"."user_id" = "users"."id" left join "words" on "definitions"."word_id" = "words"."id" left join "terms" on "words"."term" = "terms"."text" where "definitions"."deleted_at" is null and "words"."deleted_at" is null and "users"."deleted_at" is null and "definitions"."is_public" = true and not "definitions"."user_id" = \'exclude-user\' order by "definitions"."likes_count" desc, "definitions"."created_at" desc limit 20',
      );
    });
  });
});
