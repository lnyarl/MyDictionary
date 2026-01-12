import type { User } from "./user.types";

export interface Definition {
	id: string;
	content: string;
	wordId: string;
	userId: string;
	user?: User;
	word?: {
		id: string;
		term: string;
		isPublic: boolean;
	};
	likesCount: number;
	createdAt: string;
	updatedAt: string;
}

export interface CreateDefinitionInput {
	content: string;
	wordId: string;
}
