export type Definition = {
  id: string;
  content: string;
  wordId: string;
  termId: string;
  userId: string;
  isPublic: boolean;
  tags: string[];
  mediaUrls: any[];
  likesCount: number;
  isLiked: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  nickname?: string;
  profilePicture?: string;
};

export const DefinitionSelect = {
  id: "definitions.id",
  content: "content",
  wordId: "word_id",
  termId: "term_id",
  userId: "definitions.user_id",
  isPublic: "definitions.is_public",
  tags: "tags",
  mediaUrls: "media_urls",
  nickname: "users.nickname",
  profilePicture: "users.profile_picture",
  createdAt: "definitions.created_at",
  updatedAt: "definitions.updated_at",
  deletedAt: "definitions.deleted_at",
} as const;

export const OnlyDefinitionSelect = {
  id: "definitions.id",
  content: "content",
  wordId: "word_id",
  termId: "term_id",
  userId: "definitions.user_id",
  isPublic: "definitions.is_public",
  tags: "tags",
  mediaUrls: "media_urls",
  createdAt: "definitions.created_at",
  updatedAt: "definitions.updated_at",
  deletedAt: "definitions.deleted_at",
} as const;
