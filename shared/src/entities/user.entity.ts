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

export type UserInsert = {
  email: string;
  nickname: string;
  googleId?: string | null;
  profilePicture?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

export type UserUpdate = Partial<Omit<User, "id" | "createdAt" | "deletedAt">>;
