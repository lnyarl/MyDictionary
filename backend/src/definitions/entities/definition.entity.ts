export type Definition = {
  id: string;
  content: string;
  wordId: string;
  userId: string;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

// 동작을 하게 하기 위한 임시 매핑 객체
// 좋은 패턴은 아님
export const DefinitionSelect = {
  id: "id",
  content: "content",
  wordId: "word_id",
  userId: "user_id",
  likesCount: "likes_count",
  createdAt: "created_at",
  updatedAt: "updated_at",
  deletedAt: "deleted_at",
} as const;
