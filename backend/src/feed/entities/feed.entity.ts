export type Feed = {
  id: string;
  content: string;
  wordId: string;
  userId: string;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
  nickname: string;
  isPublic: boolean;
  profilePicture: string;
  term: string;
  termNumber: number;
  isLiked: boolean;
  tags: string[];
};
