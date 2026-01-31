import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

export const REDIS_CLIENT = "REDIS_CLIENT";

const trackedRedisClients = new Set<Redis>();
const originalDuplicate = Redis.prototype.duplicate;

function trackRedisClient(client: Redis): void {
  trackedRedisClients.add(client);
  client.once("end", () => trackedRedisClients.delete(client));
}

Redis.prototype.duplicate = function (this: Redis, ...args: Parameters<Redis["duplicate"]>) {
  const duplicated = originalDuplicate.apply(this, args);
  trackRedisClient(duplicated);
  return duplicated;
};

let instance: Redis | null = null;
export const redisProvider = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): Redis => {
    if (instance) {
      return instance;
    }

    const redisPassword = configService.get<string>("REDIS_PASSWORD");
    const hasPassword = !!redisPassword;
    console.log(
      `Initializing Redis client... Host: ${configService.get("REDIS_HOST")}, Password set: ${hasPassword}`,
    );

    instance = new Redis({
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
      maxRetriesPerRequest: null,
    });

    trackRedisClient(instance);

    instance.on("error", (err) => {
      console.error("Redis connection error:", err.message);
    });

    return instance;
  },
};

export async function destroyRedisInstance(): Promise<void> {
  const clients = Array.from(trackedRedisClients);
  console.log("destroyRedisInstance: tracked client count", clients.length);
  if (clients.length === 0) {
    return;
  }

  trackedRedisClients.clear();

  await Promise.all(
    clients.map(async (client) => {
      if (client.status === "close" || client.status === "end") {
        return;
      }

      try {
        await client.quit();
      } catch (error) {
        console.error("Failed to quit Redis client:", error);
      }

      try {
        client.disconnect(true);
      } catch (error) {
        console.error("Failed to disconnect Redis client:", error);
      }
    }),
  );

  instance = null;
}
