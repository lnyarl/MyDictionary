export type User = {
  id: string;
  googleId: string | null;
  email: string;
  nickname: string;
  bio: string | null;
  profilePicture: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  suspendedAt: Date | null;
};

export const UserSelect = {
  id: "id",
  googleId: "google_id",
  email: "email",
  nickname: "nickname",
  bio: "bio",
  profilePicture: "profile_picture",
  createdAt: "created_at",
  updatedAt: "updated_at",
  deletedAt: "deleted_at",
  suspendedAt: "suspended_at",
} as const;

// For database inserts (optional fields)
export type UserInsert = {
  email: string;
  nickname: string;
  googleId?: string | null;
  profilePicture?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

// For database updates
export type UserUpdate = Partial<Omit<User, "id" | "createdAt" | "deletedAt">>;
