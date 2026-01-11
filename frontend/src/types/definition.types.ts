import type { User } from "./user.types";

export interface Definition {
	id: string;
	content: string;
	wordId: string;
	userId: string;
	user?: User;
	likesCount: number;
	createdAt: string;
	updatedAt: string;
}

export interface CreateDefinitionInput {
	content: string;
	wordId: string;
}
