export const TABLES = {
  USERS: "users",
  WORDS: "words",
  DEFINITIONS: "definitions",
  DEFINITIONS_LIKE_VIEW: "vw_definitions_with_likes",
  LIKES: "likes",
  FOLLOWS: "follows",
  ADMIN_USERS: "admin_users",
} as const;

export type TableName = (typeof TABLES)[keyof typeof TABLES];
