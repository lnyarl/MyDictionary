export class Word {
  id: string;
  term: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const WordSelect = {
  id: "id",
  term: "term",
  userId: "user_id",
  createdAt: "created_at",
  updatedAt: "updated_at",
  deletedAt: "deleted_at",
} as const;

// For database inserts
export type WordInsert = Omit<
  Word,
  "id" | "createdAt" | "updatedAt" | "deletedAt" | "user" | "definitions"
> & {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

// For database updates
export type WordUpdate = Partial<
  Omit<Word, "id" | "createdAt" | "deletedAt" | "user" | "definitions">
>;
