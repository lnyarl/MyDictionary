export interface Definition {
	id: string;
	content: string;
	wordId: string;
	userId: string;
	term: string;
	profilePicture?: string;
	nickname?: string;
	likesCount: number;
	createdAt: string;
	updatedAt: string;
}

export interface CreateDefinitionInput {
	content: string;
	wordId: string;
}
