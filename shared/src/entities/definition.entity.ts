export type Definition = {
  id: string;
  content: string;
  wordId: string;
  termId: string;
  userId: string;
  isPublic: boolean;
  tags: string[];
  likesCount: number;
  isLiked: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  nickname?: string;
  profilePicture?: string;
  term: string;
  termNumber?: number;
  mediaUrls?: Array<{
    url: string;
    type: string;
    title?: string;
    description?: string;
    image?: string;
  }>;
};
