import { api } from "./api";

export type User = {
  id: string;
  googleId: string;
  email: string;
  nickname: string;
  profilePicture?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
};

export type UserProfile = {
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
};

export const usersApi = {
  updateNickname: (nickname: string) => api.patch<User>("/users/me/nickname", { nickname }),

  updateProfile: (data: { nickname?: string; bio?: string; profilePicture?: File }) => {
    const formData = new FormData();
    if (data.nickname) formData.append("nickname", data.nickname);
    if (data.bio) formData.append("bio", data.bio);
    if (data.profilePicture) formData.append("profilePicture", data.profilePicture);

    return api.patch<User>("/users/me/profile", formData);
  },

  getUserProfile: (userId: string) => api.get<UserProfile>(`/users/${userId}/profile`),

  getUserProfileByNickname: (nickname: string) =>
    api.get<UserProfile>(`/users/profile/${nickname}`),
};
