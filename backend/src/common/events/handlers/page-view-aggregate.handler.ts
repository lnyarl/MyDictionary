import { Injectable } from "@nestjs/common";
import { EventType } from "@stashy/shared";
import type { EventMessage, EventPayload, PageViewPayload } from "../event.types";
import { EventsRepository } from "../events.repository";
import type { EventHandler } from "./event-handler.interface";

@Injectable()
export class PageViewAggregateHandler implements EventHandler {
  readonly supportedEvents: EventType[] = [EventType.PAGE_VIEW];

  constructor(private readonly eventsRepository: EventsRepository) {}

  async handle(message: EventMessage<EventPayload>): Promise<void> {
    const payload = message.payload as PageViewPayload;
    const now = new Date();

    const periodStart = new Date(now);
    periodStart.setHours(0, 0, 0, 0);

    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + 1);

    const exist = await this.eventsRepository.existing(
      EventType.PAGE_VIEW,
      payload.userId,
      payload.path,
      periodStart,
    );
    if (!exist) {
      this.eventsRepository.insertAggregate(
        EventType.PAGE_VIEW,
        payload.userId,
        payload.path,
        periodStart,
        periodEnd,
        { referrer: payload.referrer },
      );
    } else {
      this.eventsRepository.updateAggregate(exist.id);
    }
  }
}
