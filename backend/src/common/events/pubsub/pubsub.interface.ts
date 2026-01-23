export interface PubSubMessage<T = unknown> {
  id: string;
  type: string;
  payload: T;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export type MessageHandler<T = unknown> = (message: PubSubMessage<T>) => Promise<void>;

export interface PubSubProvider {
  publish<T>(channel: string, message: PubSubMessage<T>): Promise<void>;

  subscribe<T>(channel: string, handler: MessageHandler<T>): Promise<void>;

  unsubscribe(channel: string): Promise<void>;

  disconnect(): Promise<void>;
}

export const PUBSUB_PROVIDER = "PUBSUB_PROVIDER";
