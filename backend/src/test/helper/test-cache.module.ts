import { Global, Module } from "@nestjs/common";
import Redis from "ioredis";
import { CacheService } from "../../common/cache/cache.service";
import { REDIS_CLIENT } from "../../common/cache/redis.provider";

let testRedisInstance: Redis | null = null;

export function createTestRedisInstance(): Redis {
  if (!testRedisInstance) {
    testRedisInstance = new Redis({
      host: process.env.TEST_REDIS_HOST || "localhost",
      port: Number(process.env.TEST_REDIS_PORT) || 6380,
      password: process.env.TEST_REDIS_PASSWORD || "testpassword",
      username: "default",
      db: 0,
      retryStrategy: (times) => {
        if (times > 3) {
          return null;
        }
        return Math.min(times * 100, 3000);
      },
    });
  }
  return testRedisInstance;
}

export async function destroyTestRedisInstance(): Promise<void> {
  if (testRedisInstance) {
    await testRedisInstance.quit();
    testRedisInstance = null;
  }
}

export async function flushTestRedis(): Promise<void> {
  if (testRedisInstance) {
    await testRedisInstance.flushdb();
  }
}

export const testRedisProvider = {
  provide: REDIS_CLIENT,
  useFactory: (): Redis => createTestRedisInstance(),
};

@Global()
@Module({
  providers: [testRedisProvider, CacheService],
  exports: [testRedisProvider, CacheService],
})
export class TestCacheModule {}
