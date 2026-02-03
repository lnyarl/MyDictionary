import { EventType } from "@stashy/shared/entities/event.entity";

export type EventMessage<T = EventPayload> = {
  id: string;
  type: EventType;
  payload: T;
  timestamp: Date;
  metadata?: Record<string, unknown>;
};

export type BaseEventPayload = {
  userId: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
};

export type PageViewPayload = BaseEventPayload & {
  path: string;
  referrer?: string;
};

export type WordEventPayload = BaseEventPayload & {
  wordId: string;
  term?: string;
};

export type DefinitionEventPayload = BaseEventPayload & {
  definitionId: string;
  wordId: string;
};

export type FollowEventPayload = BaseEventPayload & {
  targetUserId: string;
};

export type LikeEventPayload = BaseEventPayload & {
  definitionId: string;
  definitionOwnerId: string;
};

export type SearchEventPayload = BaseEventPayload & {
  query: string;
  resultsCount: number;
};

export type EventPayload =
  | PageViewPayload
  | WordEventPayload
  | DefinitionEventPayload
  | FollowEventPayload
  | LikeEventPayload
  | SearchEventPayload;
