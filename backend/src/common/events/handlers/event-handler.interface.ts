import type { EventPayload, EventType } from "../event.types";
import type { PubSubMessage } from "../pubsub/pubsub.interface";

export interface EventHandler {
  readonly supportedEvents: EventType[];

  handle(message: PubSubMessage<EventPayload>): Promise<void>;
}

export const EVENT_HANDLERS = "EVENT_HANDLERS";
