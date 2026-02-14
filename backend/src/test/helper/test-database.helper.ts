import * as fs from "node:fs";
import * as path from "node:path";
import { Knex } from "knex";
import { createTestKnexInstance, destroyTestKnexInstance } from "./test-database.module";

export class TestDatabaseHelper {
  private knex: Knex;
  private config: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };

  constructor() {
    const { instance, config } = createTestKnexInstance();
    this.knex = instance;
    this.config = config;
  }

  async setupSchema(): Promise<void> {
    try {
      await this.knex.raw(
        `DROP SCHEMA public CASCADE; 
      CREATE SCHEMA public; 
      GRANT ALL ON SCHEMA public TO ${this.config.user};`,
      );
    } catch (error) {
      console.log("Schema drop/create error (might not exist yet):", error);
      throw error;
    }
    const migrationsDir = path.resolve(process.cwd(), "migrations");

    if (!fs.existsSync(migrationsDir)) {
      throw new Error(`Migrations directory not found: ${migrationsDir}`);
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    try {
      for (const filename of files) {
        const sql = fs.readFileSync(path.join(migrationsDir, filename), "utf8");
        await this.knex.raw(sql);
      }
    } catch (error) {
      console.error("Error applying migrations:", error);
      throw error;
    }
  }

  async cleanAll(): Promise<void> {
    await this.knex("likes").del();
    await this.knex("follows").del();
    await this.knex("definitions").del();
    await this.knex("words").del();
    await this.knex("users").del();
  }

  async createUser(
    data: {
      id?: string;
      googleId?: string;
      email?: string;
      nickname?: string;
      profilePicture?: string;
      bio?: string;
    } = {},
  ): Promise<{
    id: string;
    googleId: string | null;
    email: string;
    nickname: string;
    profilePicture: string | null;
    bio: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }> {
    const id = data.id || this.generateId();
    const [user] = await this.knex("users")
      .insert({
        id,
        google_id: data.googleId ?? `google-${id}`,
        email: data.email ?? `${id}@test.com`,
        nickname: data.nickname ?? `user-${id.slice(0, 8)}`,
        profile_picture: data.profilePicture ?? null,
        bio: data.bio ?? null,
      })
      .returning("*");

    return {
      id: user.id,
      googleId: user.google_id,
      email: user.email,
      nickname: user.nickname,
      profilePicture: user.profile_picture,
      bio: user.bio,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      deletedAt: user.deleted_at,
    };
  }

  async createWord(data: { id?: string; term: string; userId: string }): Promise<{
    id: string;
    term: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }> {
    const id = data.id || this.generateId();
    const [word] = await this.knex("words")
      .insert({
        id,
        term: data.term,
        user_id: data.userId,
      })
      .returning("*");

    return {
      id: word.id,
      term: word.term,
      userId: word.user_id,
      createdAt: word.created_at,
      updatedAt: word.updated_at,
      deletedAt: word.deleted_at,
    };
  }

  async createDefinition(data: {
    id?: string;
    content: string;
    wordId: string;
    userId: string;
    tags?: string[];
    isPublic?: boolean;
    mediaUrls?: string[];
  }): Promise<{
    id: string;
    content: string;
    wordId: string;
    userId: string;
    likesCount: number;
    tags: string[];
    isPublic: boolean;
    mediaUrls: string[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }> {
    const id = data.id || this.generateId();
    const [definition] = await this.knex("vw_definitions_with_likes")
      .insert({
        id,
        content: data.content,
        word_id: data.wordId,
        user_id: data.userId,
        tags: data.tags ?? [],
        is_public: data.isPublic ?? false,
        media_urls: data.mediaUrls ?? [],
      })
      .returning("*");

    return {
      id: definition.id,
      content: definition.content,
      wordId: definition.word_id,
      userId: definition.user_id,
      likesCount: Number(definition.likes_count ?? 0),
      tags: definition.tags ?? [],
      isPublic: definition.is_public,
      mediaUrls: definition.media_urls ?? [],
      createdAt: definition.created_at,
      updatedAt: definition.updated_at,
      deletedAt: definition.deleted_at,
    };
  }

  async createLike(data: {
    id?: string;
    userId: string;
    definitionId: string;
  }): Promise<{ id: string; userId: string; definitionId: string; createdAt: Date }> {
    const id = data.id || this.generateId();
    const [like] = await this.knex("likes")
      .insert({
        id,
        user_id: data.userId,
        definition_id: data.definitionId,
      })
      .returning("*");

    return {
      id: like.id,
      userId: like.user_id,
      definitionId: like.definition_id,
      createdAt: like.created_at,
    };
  }

  async createFollow(data: {
    id?: string;
    followerId: string;
    followingId: string;
  }): Promise<{ id: string; followerId: string; followingId: string; createdAt: Date }> {
    const id = data.id || this.generateId();
    const [follow] = await this.knex("follows")
      .insert({
        id,
        follower_id: data.followerId,
        following_id: data.followingId,
      })
      .returning("*");

    return {
      id: follow.id,
      followerId: follow.follower_id,
      followingId: follow.following_id,
      createdAt: follow.created_at,
    };
  }

  private generateId(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  getKnex(): Knex {
    return this.knex;
  }

  async destroy(): Promise<void> {
    await destroyTestKnexInstance();
  }
}

let testDbHelperInstance: TestDatabaseHelper | null = null;

export function getTestDatabaseHelper(): TestDatabaseHelper {
  if (!testDbHelperInstance) {
    testDbHelperInstance = new TestDatabaseHelper();
  }
  return testDbHelperInstance;
}

export async function cleanupTestDatabase(): Promise<void> {
  if (testDbHelperInstance) {
    await testDbHelperInstance.destroy();
    testDbHelperInstance = null;
  }
}
