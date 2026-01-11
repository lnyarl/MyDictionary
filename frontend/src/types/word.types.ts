import type { Definition } from "./definition.types";

export interface Word {
	id: string;
	term: string;
	userId: string;
	isPublic: boolean;
	definitions?: Definition[];
	createdAt: string;
	updatedAt: string;
}

export interface CreateWordInput {
	term: string;
	isPublic?: boolean;
}

export interface UpdateWordInput {
	term: string;
	isPublic?: boolean;
}
