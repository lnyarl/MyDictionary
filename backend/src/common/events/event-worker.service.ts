import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import type { EventPayload, EventType } from "./event.types";
import { EventChannel } from "./event.types";
import type { EventHandler } from "./handlers/event-handler.interface";
import { EVENT_HANDLERS } from "./handlers/event-handler.interface";
import type { PubSubMessage, PubSubProvider } from "./pubsub/pubsub.interface";
import { PUBSUB_PROVIDER } from "./pubsub/pubsub.interface";

@Injectable()
export class EventWorkerService implements OnModuleInit {
  private readonly handlerMap: Map<EventType, EventHandler[]> = new Map();

  constructor(
    @Inject(PUBSUB_PROVIDER) private readonly pubsub: PubSubProvider,
    @Inject(EVENT_HANDLERS) private readonly handlers: EventHandler[],
  ) {
    this.buildHandlerMap();
  }

  private buildHandlerMap(): void {
    for (const handler of this.handlers) {
      for (const eventType of handler.supportedEvents) {
        const existing = this.handlerMap.get(eventType) || [];
        existing.push(handler);
        this.handlerMap.set(eventType, existing);
      }
    }
  }

  async onModuleInit(): Promise<void> {
    await this.subscribeToChannels();
  }

  private async subscribeToChannels(): Promise<void> {
    await this.pubsub.subscribe<EventPayload>(
      EventChannel.USER_ACTIVITY,
      this.processMessage.bind(this),
    );

    await this.pubsub.subscribe<EventPayload>(
      EventChannel.ANALYTICS,
      this.processMessage.bind(this),
    );

    console.log("EventWorkerService: Subscribed to event channels");
  }

  private async processMessage(message: PubSubMessage<EventPayload>): Promise<void> {
    const handlers = this.handlerMap.get(message.type as EventType) || [];

    if (handlers.length === 0) {
      return;
    }

    await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler.handle(message);
        } catch (error) {
          console.error(
            `Error in handler for event ${message.type}:`,
            error instanceof Error ? error.message : error,
          );
        }
      }),
    );
  }
}
