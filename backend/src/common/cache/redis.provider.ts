import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

export const REDIS_CLIENT = "REDIS_CLIENT";

export const redisProvider: Provider = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): Redis => {
    const redisPassword = configService.get<string>("REDIS_PASSWORD");
    const hasPassword = !!redisPassword;
    console.log(
      `Initializing Redis client... Host: ${configService.get("REDIS_HOST")}, Password set: ${hasPassword}`,
    );

    const redis = new Redis({
      host: configService.get("REDIS_HOST", "localhost"),
      port: configService.get("REDIS_PORT", 6379),
      password: redisPassword,
      username: "default", // For ACL compatibility
      db: configService.get("REDIS_DB", 0),
      retryStrategy: (times) => {
        if (times > 3) {
          return null;
        }
        return Math.min(times * 100, 3000);
      },
    });

    redis.on("error", (err) => {
      console.error("Redis connection error:", err.message);
    });

    return redis;
  },
};
