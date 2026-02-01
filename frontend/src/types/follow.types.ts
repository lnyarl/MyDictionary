export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
}

export interface UserProfile {
  user: {
    id: string;
    nickname: string;
    profilePicture?: string;
    createdAt: string;
    bio?: string;
  };
  stats: {
    wordsCount: number;
    definitionsCount: number;
    followersCount: number;
    followingCount: number;
  };
}
