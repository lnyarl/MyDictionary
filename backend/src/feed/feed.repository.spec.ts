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
      const { listQuery, countQuery } = repository.findFeeds(["user-1", "user-2"], 0, 10);
      const queryStr = listQuery.toQuery();
      expect(queryStr).toBe(
        'select "definitions"."id" as "id", "definitions"."content" as "content", "definitions"."word_id" as "wordId", "definitions"."user_id" as "userId", "definitions"."likes_count" as "likesCount", "definitions"."created_at" as "createdAt", "definitions"."updated_at" as "updatedAt", "users"."nickname" as "nickname", "users"."profile_picture" as "profilePicture", "words"."term" as "term" from "vw_definitions_with_likes" as "definitions" left join "users" on "definitions"."user_id" = "users"."id" left join "words" on "definitions"."word_id" = "words"."id" where "definitions"."deleted_at" is null and "definitions"."user_id" in (\'user-1\', \'user-2\') and "words"."deleted_at" is null and "definitions"."is_public" = true order by "definitions"."created_at" desc limit 10',
      );
    });

    it("should order by created_at desc", () => {
      const { listQuery, countQuery } = repository.findFeeds(["user-1"], 0, 10);
      const queryStr = listQuery.toQuery();
      expect(queryStr).toBe(
        'select "definitions"."id" as "id", "definitions"."content" as "content", "definitions"."word_id" as "wordId", "definitions"."user_id" as "userId", "definitions"."likes_count" as "likesCount", "definitions"."created_at" as "createdAt", "definitions"."updated_at" as "updatedAt", "users"."nickname" as "nickname", "users"."profile_picture" as "profilePicture", "words"."term" as "term" from "vw_definitions_with_likes" as "definitions" left join "users" on "definitions"."user_id" = "users"."id" left join "words" on "definitions"."word_id" = "words"."id" where "definitions"."deleted_at" is null and "definitions"."user_id" in (\'user-1\') and "words"."deleted_at" is null and "definitions"."is_public" = true order by "definitions"."created_at" desc limit 10',
      );
    });
  });

  describe("findRecommendations", () => {
    it("should generate correct query without exclude user", () => {
      const query = repository.findRecommendations(0, 20);
      const queryStr = query.toQuery();
      expect(queryStr).toBe(
        'select "definitions"."id" as "id", "definitions"."content" as "content", "definitions"."word_id" as "wordId", "definitions"."user_id" as "userId", "definitions"."likes_count" as "likesCount", "definitions"."created_at" as "createdAt", "definitions"."updated_at" as "updatedAt", "users"."nickname" as "nickname", "users"."profile_picture" as "profilePicture", "words"."term" as "term" from "vw_definitions_with_likes" as "definitions" left join "users" on "definitions"."user_id" = "users"."id" left join "words" on "definitions"."word_id" = "words"."id" where "definitions"."deleted_at" is null and "words"."deleted_at" is null and "users"."deleted_at" is null and "definitions"."is_public" = true order by "definitions"."likes_count" desc, "definitions"."created_at" desc limit 20',
      );
    });

    it("should generate correct query with exclude user", () => {
      const query = repository.findRecommendations(0, 20, "exclude-user");
      const queryStr = query.toQuery();
      expect(queryStr).toBe(
        'select "definitions"."id" as "id", "definitions"."content" as "content", "definitions"."word_id" as "wordId", "definitions"."user_id" as "userId", "definitions"."likes_count" as "likesCount", "definitions"."created_at" as "createdAt", "definitions"."updated_at" as "updatedAt", "users"."nickname" as "nickname", "users"."profile_picture" as "profilePicture", "words"."term" as "term" from "vw_definitions_with_likes" as "definitions" left join "users" on "definitions"."user_id" = "users"."id" left join "words" on "definitions"."word_id" = "words"."id" where "definitions"."deleted_at" is null and "words"."deleted_at" is null and "users"."deleted_at" is null and "definitions"."is_public" = true and not "definitions"."user_id" = \'exclude-user\' order by "definitions"."likes_count" desc, "definitions"."created_at" desc limit 20',
      );
    });

    it("should order by likes_count and created_at desc", () => {
      const query = repository.findRecommendations(5, 15);
      const queryStr = query.toQuery();
      expect(queryStr).toBe(
        'select "definitions"."id" as "id", "definitions"."content" as "content", "definitions"."word_id" as "wordId", "definitions"."user_id" as "userId", "definitions"."likes_count" as "likesCount", "definitions"."created_at" as "createdAt", "definitions"."updated_at" as "updatedAt", "users"."nickname" as "nickname", "users"."profile_picture" as "profilePicture", "words"."term" as "term" from "vw_definitions_with_likes" as "definitions" left join "users" on "definitions"."user_id" = "users"."id" left join "words" on "definitions"."word_id" = "words"."id" where "definitions"."deleted_at" is null and "words"."deleted_at" is null and "users"."deleted_at" is null and "definitions"."is_public" = true order by "definitions"."likes_count" desc, "definitions"."created_at" desc limit 15 offset 5',
      );
    });
  });
});
