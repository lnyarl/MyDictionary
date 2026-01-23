export class Event {
  id: string;
  type: string;
  userId: string | null;
  payload: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export const EventSelect = {
  id: "id",
  type: "type",
  userId: "user_id",
  payload: "payload",
  metadata: "metadata",
  createdAt: "created_at",
} as const;

export class EventAggregate {
  id: string;
  type: string;
  userId: string | null;
  aggregateKey: string;
  count: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
  metadata: Record<string, unknown>;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const EventAggregateSelect = {
  id: "id",
  type: "type",
  userId: "user_id",
  aggregateKey: "aggregate_key",
  count: "count",
  firstOccurrence: "first_occurrence",
  lastOccurrence: "last_occurrence",
  metadata: "metadata",
  periodStart: "period_start",
  periodEnd: "period_end",
  createdAt: "created_at",
  updatedAt: "updated_at",
} as const;
