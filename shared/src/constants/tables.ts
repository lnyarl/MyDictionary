export const TABLES = {
  USERS: "users",
  WORDS: "words",
  DEFINITIONS: "definitions",
  DEFINITIONS_LIKE_VIEW: "vw_definitions_with_likes",
  LIKES: "likes",
  FOLLOWS: "follows",
  ADMIN_USERS: "admin_users",
  NOTIFICATIONS: "notifications",
  EVENTS: "events",
  EVENT_AGGREGATES: "event_aggregates",
  BADGES: "badges",
  USER_BADGES: "user_badges",
  USER_BADGE_PROGRESS: "user_badge_progress",
  REPORTS: "reports",
} as const;

export type TableName = (typeof TABLES)[keyof typeof TABLES];
