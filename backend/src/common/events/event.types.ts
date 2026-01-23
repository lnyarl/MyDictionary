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
}

export enum EventChannel {
  USER_ACTIVITY = "events:user_activity",
  ANALYTICS = "events:analytics",
}

export interface BaseEventPayload {
  userId: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface PageViewPayload extends BaseEventPayload {
  path: string;
  referrer?: string;
}

export interface WordEventPayload extends BaseEventPayload {
  wordId: string;
  term?: string;
}

export interface DefinitionEventPayload extends BaseEventPayload {
  definitionId: string;
  wordId: string;
}

export interface FollowEventPayload extends BaseEventPayload {
  targetUserId: string;
}

export interface LikeEventPayload extends BaseEventPayload {
  definitionId: string;
  definitionOwnerId: string;
}

export interface SearchEventPayload extends BaseEventPayload {
  query: string;
  resultsCount: number;
}

export type EventPayload =
  | PageViewPayload
  | WordEventPayload
  | DefinitionEventPayload
  | FollowEventPayload
  | LikeEventPayload
  | SearchEventPayload;
