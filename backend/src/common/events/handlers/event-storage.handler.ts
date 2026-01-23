import { Injectable } from "@nestjs/common";
import type { EventPayload } from "../event.types";
import { EventType } from "../event.types";
import { EventsRepository } from "../events.repository";
import type { PubSubMessage } from "../pubsub/pubsub.interface";
import type { EventHandler } from "./event-handler.interface";

@Injectable()
export class EventStorageHandler implements EventHandler {
  readonly supportedEvents: EventType[] = Object.values(EventType);

  constructor(private readonly eventsRepository: EventsRepository) {}

  async handle(message: PubSubMessage<EventPayload>): Promise<void> {
    await this.eventsRepository.createEvent({
      type: message.type,
      userId: message.payload.userId || null,
      payload: message.payload as unknown as Record<string, unknown>,
      metadata: (message.metadata || {}) as Record<string, unknown>,
    });
  }
}
