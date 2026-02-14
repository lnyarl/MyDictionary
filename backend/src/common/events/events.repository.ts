import { Injectable } from "@nestjs/common";
import { EventType, generateId } from "@stashy/shared";
import { BaseRepository } from "../database/base.repository";
import type { Event, EventAggregate } from "./entities/event.entity";
import { EventAggregateSelect } from "./entities/event.entity";

@Injectable()
export class EventsRepository extends BaseRepository {
  createEvent(event: Omit<Event, "id" | "createdAt">) {
    const now = new Date();
    return this.knex("events").insert({
      id: generateId(),
      type: event.type,
      user_id: event.userId,
      payload: JSON.stringify(event.payload),
      metadata: JSON.stringify(event.metadata || {}),
      created_at: now,
    });
  }

  existing(type: EventType, userId: string, aggregateKey: string, periodStart: Date) {
    return this.knex("event_aggregates")
      .where({
        type,
        user_id: userId,
        aggregate_key: aggregateKey,
        period_start: periodStart,
      })
      .first();
  }

  updateAggregate(id: string) {
    const now = new Date();
    return this.knex("event_aggregates")
      .where({ id: id })
      .update({
        count: this.knex.raw("count + 1"),
        last_occurrence: now,
        updated_at: now,
      });
  }

  insertAggregate(
    type: string,
    userId: string | null,
    aggregateKey: string,
    periodStart: Date,
    periodEnd: Date,
    metadata?: Record<string, unknown>,
  ) {
    const now = new Date();
    return this.knex("event_aggregates").insert({
      id: generateId(),
      type,
      user_id: userId,
      aggregate_key: aggregateKey,
      count: 1,
      first_occurrence: now,
      last_occurrence: now,
      metadata: JSON.stringify(metadata || {}),
      period_start: periodStart,
      period_end: periodEnd,
      created_at: now,
      updated_at: now,
    });
  }

  findAggregates(
    type: string,
    userId?: string,
    periodStart?: Date,
    periodEnd?: Date,
  ): Promise<EventAggregate[]> {
    const query = this.query("event_aggregates").where({ type });

    if (userId) {
      query.where({ user_id: userId });
    }
    if (periodStart) {
      query.where("period_start", ">=", periodStart);
    }
    if (periodEnd) {
      query.where("period_end", "<=", periodEnd);
    }

    return query.select(EventAggregateSelect).orderBy("period_start", "desc");
  }

  getAggregateCount(type: string, aggregateKey: string, userId?: string) {
    const query = this.query("event_aggregates")
      .where({ type, aggregate_key: aggregateKey })
      .sum<{ total: string }>("count as total")
      .first();

    if (userId) {
      query.where({ user_id: userId });
    }

    return query;
  }
}
