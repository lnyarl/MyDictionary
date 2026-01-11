import type { User } from "../types/user.types";
import { api } from "./api";

export const usersApi = {
	updateNickname: (nickname: string) =>
		api.patch<User>("/users/me/nickname", { nickname }),
};
