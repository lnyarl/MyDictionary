import type { EventMessage, EventPayload, EventType } from "../event.types";

export interface EventHandler {
  readonly supportedEvents: EventType[];

  handle(message: EventMessage<EventPayload>): Promise<void>;
}

export const EVENT_HANDLERS = "EVENT_HANDLERS";
