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
