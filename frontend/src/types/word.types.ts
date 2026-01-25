import type { Definition } from "./definition.types";

export interface Word {
	id: string;
	term: string;
	userId: string;
	definitions?: Definition[];
	createdAt: string;
	updatedAt: string;
}

export interface CreateDefinitionInput {
	content: string;
	tags?: string[];
	isPublic?: boolean;
}

export interface CreateWordInput {
	term: string;
	definition: CreateDefinitionInput;
}

export interface UpdateWordInput {
	term: string;
}
