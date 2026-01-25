import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";
import { REDIS_CLIENT } from "./redis.provider";

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly defaultTTL = 60;

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async onModuleDestroy() {
    await this.redis.quit();
  }

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    if (!cached) return null;
    try {
      return JSON.parse(cached) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = this.defaultTTL): Promise<void> {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async deletePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  feedKey(userId: string, page: number, limit: number): string {
    return `feed:${userId}:${page}:${limit}`;
  }

  myFeedKey(userId: string, page: number, limit: number): string {
    return `my_feed:${userId}:${page}:${limit}`;
  }

  allFeedKey(page: number): string {
    return `all_feed:${page}`;
  }

  feedPattern(userId: string): string {
    return `feed:${userId}:*`;
  }

  recommendationsKey(page: number): string {
    return `recommendations:${page}`;
  }

  recommendationsPattern(): string {
    return "recommendations:*";
  }
}
