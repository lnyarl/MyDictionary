import { User } from "@shared";
import { Definition } from "../../definitions/entities/definition.entity";

export class Word {
  id: string;
  term: string;
  userId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  user?: User;
  definitions?: Definition[];
}

export const WordSelect = {
  id: "id",
  term: "term",
  userId: "user_id",
  isPublic: "is_public",
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
  isPublic?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

// For database updates
export type WordUpdate = Partial<
  Omit<Word, "id" | "createdAt" | "deletedAt" | "user" | "definitions">
>;
