import { TABLES } from "@shared";
import { Knex } from "knex";
import { createTestKnexInstance, destroyTestKnexInstance } from "./test-database.module";

export class TestDatabaseHelper {
  private knex: Knex;

  constructor() {
    this.knex = createTestKnexInstance();
  }

  async setupSchema(): Promise<void> {
    const hasUsers = await this.knex.schema.hasTable(TABLES.USERS);
    if (!hasUsers) {
      await this.knex.schema.createTable(TABLES.USERS, (table) => {
        table.uuid("id").primary().defaultTo(this.knex.raw("gen_random_uuid()"));
        table.string("google_id", 255).unique();
        table.string("email", 255).unique().notNullable();
        table.string("nickname", 255).unique().notNullable();
        table.string("profile_picture", 500);
        table.text("bio");
        table.timestamp("created_at").notNullable().defaultTo(this.knex.fn.now());
        table.timestamp("updated_at").notNullable().defaultTo(this.knex.fn.now());
        table.timestamp("deleted_at");
      });
    }

    const hasWords = await this.knex.schema.hasTable(TABLES.WORDS);
    if (!hasWords) {
      await this.knex.schema.createTable(TABLES.WORDS, (table) => {
        table.uuid("id").primary().defaultTo(this.knex.raw("gen_random_uuid()"));
        table.string("term", 100).notNullable();
        table
          .uuid("user_id")
          .notNullable()
          .references("id")
          .inTable(TABLES.USERS)
          .onDelete("CASCADE");
        table.boolean("is_public").notNullable().defaultTo(false);
        table.timestamp("created_at").notNullable().defaultTo(this.knex.fn.now());
        table.timestamp("updated_at").notNullable().defaultTo(this.knex.fn.now());
        table.timestamp("deleted_at");
      });
    }

    const hasDefinitions = await this.knex.schema.hasTable(TABLES.DEFINITIONS);
    if (!hasDefinitions) {
      await this.knex.schema.createTable(TABLES.DEFINITIONS, (table) => {
        table.uuid("id").primary().defaultTo(this.knex.raw("gen_random_uuid()"));
        table.text("content").notNullable();
        table
          .uuid("word_id")
          .notNullable()
          .references("id")
          .inTable(TABLES.WORDS)
          .onDelete("CASCADE");
        table
          .uuid("user_id")
          .notNullable()
          .references("id")
          .inTable(TABLES.USERS)
          .onDelete("CASCADE");
        table.integer("likes_count").notNullable().defaultTo(0);
        table.specificType("tags", "text[]").defaultTo("{}");
        table.jsonb("media_urls").defaultTo("[]");
        table.jsonb("link_metadata");
        table.timestamp("created_at").notNullable().defaultTo(this.knex.fn.now());
        table.timestamp("updated_at").notNullable().defaultTo(this.knex.fn.now());
        table.timestamp("deleted_at");
      });
    }

    const hasLikes = await this.knex.schema.hasTable(TABLES.LIKES);
    if (!hasLikes) {
      await this.knex.schema.createTable(TABLES.LIKES, (table) => {
        table.uuid("id").primary().defaultTo(this.knex.raw("gen_random_uuid()"));
        table
          .uuid("user_id")
          .notNullable()
          .references("id")
          .inTable(TABLES.USERS)
          .onDelete("CASCADE");
        table
          .uuid("definition_id")
          .notNullable()
          .references("id")
          .inTable(TABLES.DEFINITIONS)
          .onDelete("CASCADE");
        table.timestamp("created_at").notNullable().defaultTo(this.knex.fn.now());
        table.timestamp("updated_at").notNullable().defaultTo(this.knex.fn.now());
        table.timestamp("deleted_at");
        table.unique(["user_id", "definition_id"]);
      });
    }

    const hasFollows = await this.knex.schema.hasTable(TABLES.FOLLOWS);
    if (!hasFollows) {
      await this.knex.schema.createTable(TABLES.FOLLOWS, (table) => {
        table.uuid("id").primary().defaultTo(this.knex.raw("gen_random_uuid()"));
        table
          .uuid("follower_id")
          .notNullable()
          .references("id")
          .inTable(TABLES.USERS)
          .onDelete("CASCADE");
        table
          .uuid("following_id")
          .notNullable()
          .references("id")
          .inTable(TABLES.USERS)
          .onDelete("CASCADE");
        table.timestamp("created_at").notNullable().defaultTo(this.knex.fn.now());
        table.timestamp("updated_at").notNullable().defaultTo(this.knex.fn.now());
        table.timestamp("deleted_at");
        table.unique(["follower_id", "following_id"]);
      });
    }

    await this.knex.raw(`
      CREATE OR REPLACE VIEW ${TABLES.DEFINITIONS_LIKE_VIEW} AS
      SELECT 
        d.id,
        d.content,
        d.word_id,
        d.user_id,
        d.tags,
        d.media_urls,
        d.link_metadata,
        d.created_at,
        d.updated_at,
        d.deleted_at,
        COALESCE(l.likes_count, 0)::integer as likes_count
      FROM ${TABLES.DEFINITIONS} d
      LEFT JOIN (
        SELECT definition_id, COUNT(*) as likes_count
        FROM ${TABLES.LIKES}
        WHERE deleted_at IS NULL
        GROUP BY definition_id
      ) l ON d.id = l.definition_id
      WHERE d.deleted_at IS NULL
    `);
  }

  async cleanAll(): Promise<void> {
    await this.knex(TABLES.LIKES).del();
    await this.knex(TABLES.FOLLOWS).del();
    await this.knex(TABLES.DEFINITIONS).del();
    await this.knex(TABLES.WORDS).del();
    await this.knex(TABLES.USERS).del();
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
    const [user] = await this.knex(TABLES.USERS)
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

  async createWord(data: {
    id?: string;
    term: string;
    userId: string;
    isPublic?: boolean;
  }): Promise<{
    id: string;
    term: string;
    userId: string;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }> {
    const id = data.id || this.generateId();
    const [word] = await this.knex(TABLES.WORDS)
      .insert({
        id,
        term: data.term,
        user_id: data.userId,
        is_public: data.isPublic ?? true,
      })
      .returning("*");

    return {
      id: word.id,
      term: word.term,
      userId: word.user_id,
      isPublic: word.is_public,
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
    mediaUrls?: string[];
  }): Promise<{
    id: string;
    content: string;
    wordId: string;
    userId: string;
    likesCount: number;
    tags: string[];
    mediaUrls: string[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }> {
    const id = data.id || this.generateId();
    const [definition] = await this.knex(TABLES.DEFINITIONS)
      .insert({
        id,
        content: data.content,
        word_id: data.wordId,
        user_id: data.userId,
        tags: data.tags ?? [],
        media_urls: data.mediaUrls ?? [],
      })
      .returning("*");

    return {
      id: definition.id,
      content: definition.content,
      wordId: definition.word_id,
      userId: definition.user_id,
      likesCount: definition.likes_count,
      tags: definition.tags ?? [],
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
    const [like] = await this.knex(TABLES.LIKES)
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
    const [follow] = await this.knex(TABLES.FOLLOWS)
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
