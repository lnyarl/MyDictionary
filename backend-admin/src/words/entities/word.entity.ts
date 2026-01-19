export class Word {
  id: string;
  term: string;
  userId: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
