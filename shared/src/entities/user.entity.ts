export class User {
  id: string;
  googleId: string | null;
  email: string;
  nickname: string;
  profilePicture: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const UserSelect = {
  id: "id",
  googleId: "google_id",
  email: "email",
  nickname: "nickname",
  profilePicture: "profile_picture",
  createdAt: "created_at",
  updatedAt: "updated_at",
  deletedAt: "deleted_at",
} as const;

// For database inserts (optional fields)
export type UserInsert = Omit<User, "id" | "createdAt" | "updatedAt" | "deletedAt" | "googleId"> & {
  id?: string;
  googleId?: string | null;
  profilePicture?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

// For database updates
export type UserUpdate = Partial<Omit<User, "id" | "createdAt" | "deletedAt">>;
