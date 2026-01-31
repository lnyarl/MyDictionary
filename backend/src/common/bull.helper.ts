import { BullModule } from "@nestjs/bullmq";
import type { DynamicModule } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { REDIS_CLIENT, redisProvider } from "./cache/redis.provider";

export function getBullQueueProvider(name: string): DynamicModule | Promise<DynamicModule> {
  return BullModule.registerQueueAsync({
    name,
    inject: [REDIS_CLIENT, ConfigService],
    useFactory: (redis: Redis) => ({
      connection: redis,
    }),
    extraProviders: [redisProvider],
  });
}
