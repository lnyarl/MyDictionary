import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";
import { REDIS_CLIENT } from "../../cache/redis.provider";
import type { MessageHandler, PubSubMessage, PubSubProvider } from "./pubsub.interface";

@Injectable()
export class RedisPubSubProvider implements PubSubProvider, OnModuleDestroy {
  private readonly subscriber: Redis;
  private readonly publisher: Redis;
  private readonly handlers: Map<string, MessageHandler> = new Map();

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {
    this.publisher = redis;
    this.subscriber = redis.duplicate();

    this.subscriber.on("message", (channel: string, message: string) => {
      this.handleMessage(channel, message);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  async publish<T>(channel: string, message: PubSubMessage<T>): Promise<void> {
    const serialized = JSON.stringify(message);
    await this.publisher.publish(channel, serialized);
  }

  async subscribe<T>(channel: string, handler: MessageHandler<T>): Promise<void> {
    this.handlers.set(channel, handler as MessageHandler);
    await this.subscriber.subscribe(channel);
  }

  async unsubscribe(channel: string): Promise<void> {
    this.handlers.delete(channel);
    await this.subscriber.unsubscribe(channel);
  }

  async disconnect(): Promise<void> {
    await this.subscriber.quit();
  }

  private async handleMessage(channel: string, rawMessage: string): Promise<void> {
    const handler = this.handlers.get(channel);
    if (!handler) return;

    try {
      const message: PubSubMessage = JSON.parse(rawMessage);
      await handler(message);
    } catch (error) {
      console.error(`Error processing message on channel ${channel}:`, error);
    }
  }
}
