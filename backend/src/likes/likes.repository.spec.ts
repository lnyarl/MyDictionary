import "reflect-metadata";
import {
  cleanupTestDatabase,
  getTestDatabaseHelper,
  TestDatabaseHelper,
} from "../test/helper/test-database.helper";
import { LikesRepository } from "./likes.repository";

describe("LikesRepository", () => {
  let repository: LikesRepository;
  let testDb: TestDatabaseHelper;

  beforeAll(async () => {
    testDb = getTestDatabaseHelper();
    await testDb.setupSchema();
    repository = new LikesRepository(testDb.getKnex());
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe("findByUserIdAndDefinitionId", () => {
    it("should generate correct query", () => {
      const query = repository.findByUserIdAndDefinitionId("user-123", "def-456");
      expect(query.toQuery()).toBe(
        'select "id" as "id", "user_id" as "userId", "definition_id" as "definitionId", "created_at" as "createdAt", "updated_at" as "updatedAt", "deleted_at" as "deletedAt" from "likes" where "likes"."deleted_at" is null and "user_id" = \'user-123\' and "definition_id" = \'def-456\' limit 1',
      );
    });
  });

  describe("findByDefinitionId", () => {
    it("should generate correct query", () => {
      const query = repository.findByDefinitionId("def-123");
      expect(query.toQuery()).toBe(
        'select "id" as "id", "user_id" as "userId", "definition_id" as "definitionId", "created_at" as "createdAt", "updated_at" as "updatedAt", "deleted_at" as "deletedAt" from "likes" where "likes"."deleted_at" is null and "definition_id" = \'def-123\'',
      );
    });
  });
});
