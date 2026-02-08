export type RefreshToken = {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  fromAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};
