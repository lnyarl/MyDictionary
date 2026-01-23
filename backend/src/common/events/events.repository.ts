import { Injectable } from "@nestjs/common";
import { generateId, TABLES } from "@shared";
import { BaseRepository } from "../database/base.repository";
import type { Event, EventAggregate } from "./entities/event.entity";
import { EventAggregateSelect, EventSelect } from "./entities/event.entity";

@Injectable()
export class EventsRepository extends BaseRepository {
  private readonly eventsTable = TABLES.EVENTS;
  private readonly aggregatesTable = TABLES.EVENT_AGGREGATES;

  async createEvent(event: Omit<Event, "id" | "createdAt">): Promise<Event> {
    const now = new Date();
    const [created] = await this.knex(this.eventsTable)
      .insert({
        id: generateId(),
        type: event.type,
        user_id: event.userId,
        payload: JSON.stringify(event.payload),
        metadata: JSON.stringify(event.metadata || {}),
        created_at: now,
      })
      .returning(Object.values(EventSelect));

    return this.mapEvent(created);
  }

  async findEventsByType(
    type: string,
    limit: number,
    offset: number,
  ): Promise<{ events: Event[]; total: number }> {
    const baseQuery = this.knex(this.eventsTable).where({ type });

    const [events, countResult] = await Promise.all([
      baseQuery
        .clone()
        .select(EventSelect)
        .orderBy("created_at", "desc")
        .limit(limit)
        .offset(offset),
      baseQuery.clone().count<{ count: string }>("id as count").first(),
    ]);

    return {
      events: events.map(this.mapEvent),
      total: Number(countResult?.count || 0),
    };
  }

  async findEventsByUserId(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{ events: Event[]; total: number }> {
    const baseQuery = this.knex(this.eventsTable).where({ user_id: userId });

    const [events, countResult] = await Promise.all([
      baseQuery
        .clone()
        .select(EventSelect)
        .orderBy("created_at", "desc")
        .limit(limit)
        .offset(offset),
      baseQuery.clone().count<{ count: string }>("id as count").first(),
    ]);

    return {
      events: events.map(this.mapEvent),
      total: Number(countResult?.count || 0),
    };
  }

  async upsertAggregate(
    type: string,
    userId: string | null,
    aggregateKey: string,
    periodStart: Date,
    periodEnd: Date,
    metadata?: Record<string, unknown>,
  ): Promise<EventAggregate> {
    const now = new Date();

    const existing = await this.knex(this.aggregatesTable)
      .where({
        type,
        user_id: userId,
        aggregate_key: aggregateKey,
        period_start: periodStart,
      })
      .first();

    if (existing) {
      const [updated] = await this.knex(this.aggregatesTable)
        .where({ id: existing.id })
        .update({
          count: this.knex.raw("count + 1"),
          last_occurrence: now,
          updated_at: now,
        })
        .returning(Object.values(EventAggregateSelect));

      return this.mapAggregate(updated);
    }

    const [created] = await this.knex(this.aggregatesTable)
      .insert({
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
      })
      .returning(Object.values(EventAggregateSelect));

    return this.mapAggregate(created);
  }

  async findAggregates(
    type: string,
    userId?: string,
    periodStart?: Date,
    periodEnd?: Date,
  ): Promise<EventAggregate[]> {
    const query = this.knex(this.aggregatesTable).where({ type });

    if (userId) {
      query.where({ user_id: userId });
    }
    if (periodStart) {
      query.where("period_start", ">=", periodStart);
    }
    if (periodEnd) {
      query.where("period_end", "<=", periodEnd);
    }

    const results = await query.select(EventAggregateSelect).orderBy("period_start", "desc");

    return results.map(this.mapAggregate);
  }

  async getAggregateCount(type: string, aggregateKey: string, userId?: string): Promise<number> {
    const query = this.knex(this.aggregatesTable)
      .where({ type, aggregate_key: aggregateKey })
      .sum<{ total: string }>("count as total")
      .first();

    if (userId) {
      query.where({ user_id: userId });
    }

    const result = await query;
    return Number(result?.total || 0);
  }

  private mapEvent(row: Record<string, unknown>): Event {
    return {
      id: row.id as string,
      type: row.type as string,
      userId: row.user_id as string | null,
      payload: typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload,
      metadata: typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata,
      createdAt: row.created_at as Date,
    } as Event;
  }

  private mapAggregate(row: Record<string, unknown>): EventAggregate {
    return {
      id: row.id as string,
      type: row.type as string,
      userId: row.user_id as string | null,
      aggregateKey: row.aggregate_key as string,
      count: Number(row.count),
      firstOccurrence: row.first_occurrence as Date,
      lastOccurrence: row.last_occurrence as Date,
      metadata: typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata,
      periodStart: row.period_start as Date,
      periodEnd: row.period_end as Date,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
    } as EventAggregate;
  }
}
