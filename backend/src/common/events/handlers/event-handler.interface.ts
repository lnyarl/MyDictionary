import { EventType } from "@stashy/shared";
import type { EventMessage, EventPayload } from "../event.types";

export interface EventHandler {
  readonly supportedEvents: EventType[];

  handle(message: EventMessage<EventPayload>): Promise<void>;
}

export const EVENT_HANDLERS = "EVENT_HANDLERS";
