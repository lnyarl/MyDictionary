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
        'select "id" as "id", "term" as "term", "user_id" as "userId", "created_at" as "createdAt", "updated_at" as "updatedAt", "deleted_at" as "deletedAt" from "words" where "words"."deleted_at" is null and "user_id" = \'user-123\' order by "created_at" desc',
      );
    });
  });

  describe("findPublicByUserId", () => {
    it("should generate correct query", () => {
      const { listQuery, countQuery } = repository.findPublicByUserId("user-123", 10, 5);
      expect(listQuery.toQuery()).toBe(
        'select "id" as "id", "term" as "term", "user_id" as "userId", "created_at" as "createdAt", "updated_at" as "updatedAt", "deleted_at" as "deletedAt" from "words" where "words"."deleted_at" is null and "user_id" = \'user-123\' and exists (select * from "definitions" where definitions.word_id = words.id and "definitions"."is_public" = true and "definitions"."deleted_at" is null) order by "created_at" desc limit 10 offset 5',
      );
      expect(countQuery.toQuery()).toBe(
        'select count(*) as "count" from "words" where "words"."deleted_at" is null and "user_id" = \'user-123\' and exists (select * from "definitions" where definitions.word_id = words.id and "definitions"."is_public" = true and "definitions"."deleted_at" is null) limit 1',
      );
    });
  });

  describe("countPublicByUserId", () => {
    it("should generate correct query", () => {
      const query = repository.countPublicByUserId("user-123");
      expect(query.toQuery()).toBe(
        'select count(*) as "count" from "words" where "words"."deleted_at" is null and "user_id" = \'user-123\' and exists (select * from "definitions" where definitions.word_id = words.id and "definitions"."is_public" = true and "definitions"."deleted_at" is null) limit 1',
      );
    });
  });

  describe("findById", () => {
    it("should generate correct query", () => {
      const query = repository.findById("word-123");
      expect(query.toQuery()).toBe(
        'select "id" as "id", "term" as "term", "user_id" as "userId", "created_at" as "createdAt", "updated_at" as "updatedAt", "deleted_at" as "deletedAt" from "words" where "words"."deleted_at" is null and "id" = \'word-123\' limit 1',
      );
    });
  });

  describe("searchWithDefinitions", () => {
    it("should generate correct query without userId", () => {
      const { listQuery, countQuery } = repository.searchWithDefinitions("test", undefined, 10, 0);
      expect(countQuery.toQuery()).toBe(
        'select count(*) as "count" from "words" where "words"."deleted_at" is null and "words"."term" ilike \'%test%\' and exists (select * from "definitions" where definitions.word_id = words.id and "definitions"."is_public" = true and "definitions"."deleted_at" is null) limit 1',
      );
      expect(listQuery.toQuery()).toBe(
        `select "words"."id", "words"."term", "words"."user_id" as "userId", "words"."created_at" as "createdAt", "words"."updated_at" as "updatedAt", "words"."deleted_at" as "deletedAt", 
          COALESCE(
            json_agg(
              json_build_object(
                'id', d.id,
                'content', d.content,
                'wordId', d.word_id,
                'userId', d.user_id,
                'likesCount', 0,
                'createdAt', d.created_at,
                'updatedAt', d.updated_at,
                'user', json_build_object(
                  'id', du.id,
                  'nickname', du.nickname,
                  'email', du.email,
                  'googleId', du.google_id,
                  'profilePicture', du.profile_picture,
                  'createdAt', du.created_at,
                  'updatedAt', du.updated_at,
                  'deletedAt', du.deleted_at
                )
              ) ORDER BY d.created_at DESC
            ) FILTER (WHERE d.id IS NOT NULL),
            '[]'
          ) as definitions
        , 
          json_build_object(
            'id', wu.id,
            'nickname', wu.nickname,
            'email', wu.email,
            'googleId', wu.google_id,
            'profilePicture', wu.profile_picture,
            'createdAt', wu.created_at,
            'updatedAt', wu.updated_at,
            'deletedAt', wu.deleted_at
          ) as user
         from "words" left join "definitions" as "d" on "d"."word_id" = "words"."id" and "d"."deleted_at" is null left join "users" as "du" on "du"."id" = "d"."user_id" and "du"."deleted_at" is null left join "users" as "wu" on "wu"."id" = "words"."user_id" and "wu"."deleted_at" is null where "words"."deleted_at" is null and "words"."term" ilike '%test%' and exists (select * from "definitions" where definitions.word_id = words.id and "definitions"."is_public" = true and "definitions"."deleted_at" is null) group by "words"."id", "wu"."id" order by "words"."created_at" desc limit 10`,
      );
    });

    it("should generate correct query with userId", () => {
      const { listQuery, countQuery } = repository.searchWithDefinitions("test", "user-123", 10, 0);
      expect(countQuery.toQuery()).toBe(
        'select count(*) as "count" from "words" where "words"."deleted_at" is null and "words"."term" ilike \'%test%\' and ("words"."user_id" = \'user-123\' or exists (select * from "definitions" where definitions.word_id = words.id and "definitions"."is_public" = true and "definitions"."deleted_at" is null)) limit 1',
      );
      expect(
        listQuery.toQuery(),
      ).toBe(`select "words"."id", "words"."term", "words"."user_id" as "userId", "words"."created_at" as "createdAt", "words"."updated_at" as "updatedAt", "words"."deleted_at" as "deletedAt", 
          COALESCE(
            json_agg(
              json_build_object(
                'id', d.id,
                'content', d.content,
                'wordId', d.word_id,
                'userId', d.user_id,
                'likesCount', 0,
                'createdAt', d.created_at,
                'updatedAt', d.updated_at,
                'user', json_build_object(
                  'id', du.id,
                  'nickname', du.nickname,
                  'email', du.email,
                  'googleId', du.google_id,
                  'profilePicture', du.profile_picture,
                  'createdAt', du.created_at,
                  'updatedAt', du.updated_at,
                  'deletedAt', du.deleted_at
                )
              ) ORDER BY d.created_at DESC
            ) FILTER (WHERE d.id IS NOT NULL),
            '[]'
          ) as definitions
        , 
          json_build_object(
            'id', wu.id,
            'nickname', wu.nickname,
            'email', wu.email,
            'googleId', wu.google_id,
            'profilePicture', wu.profile_picture,
            'createdAt', wu.created_at,
            'updatedAt', wu.updated_at,
            'deletedAt', wu.deleted_at
          ) as user
         from "words" left join "definitions" as "d" on "d"."word_id" = "words"."id" and "d"."deleted_at" is null left join "users" as "du" on "du"."id" = "d"."user_id" and "du"."deleted_at" is null left join "users" as "wu" on "wu"."id" = "words"."user_id" and "wu"."deleted_at" is null where "words"."deleted_at" is null and "words"."term" ilike '%test%' and ("words"."user_id" = 'user-123' or exists (select * from "definitions" where definitions.word_id = words.id and "definitions"."is_public" = true and "definitions"."deleted_at" is null)) group by "words"."id", "wu"."id" order by "words"."created_at" desc limit 10`);
    });
  });
});
