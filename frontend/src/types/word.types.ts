import type { Definition } from "./definition.types";

export interface Word {
	id: string;
	term: string;
	userId: string;
	definitions?: Definition[];
	createdAt: string;
	updatedAt: string;
}

export interface CreateWordInput {
	term: string;
}

export interface UpdateWordInput {
	term: string;
}
