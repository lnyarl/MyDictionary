export enum EventType {
  PAGE_VIEW = "page_view",
  WORD_CREATE = "word_create",
  WORD_UPDATE = "word_update",
  WORD_DELETE = "word_delete",
  DEFINITION_CREATE = "definition_create",
  DEFINITION_UPDATE = "definition_update",
  DEFINITION_DELETE = "definition_delete",
  USER_FOLLOW = "user_follow",
  USER_UNFOLLOW = "user_unfollow",
  DEFINITION_LIKE = "definition_like",
  DEFINITION_UNLIKE = "definition_unlike",
  SEARCH = "search",
  USER_DAILY_LOGIN = "user_daily_login",
  USER_LOGIN_STREAK = "user_login_streak",
}

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

export type DailyLoginPayload = BaseEventPayload;

export type LoginStreakPayload = BaseEventPayload & {
  streak: number;
};

export type EventPayload =
  | PageViewPayload
  | WordEventPayload
  | DefinitionEventPayload
  | FollowEventPayload
  | LikeEventPayload
  | SearchEventPayload
  | DailyLoginPayload
  | LoginStreakPayload;
