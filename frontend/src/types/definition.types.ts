export interface Definition {
	id: string;
	content: string;
	wordId: string;
	userId: string;
	term: string;
	isPublic: boolean;
	profilePicture?: string;
	nickname?: string;
	likesCount: number;
	tags?: string[];
	mediaUrls?: Array<{
		url: string;
		type: "image" | "video" | "unknown";
		title?: string;
		description?: string;
		image?: string;
	}>;
	createdAt: string;
	updatedAt: string;
}

export interface CreateDefinitionInput {
	content: string;
	wordId: string;
	isPublic?: boolean;
	tags?: string[];
	files?: File[];
}

export interface UpdateDefinitionInput {
	content?: string;
	isPublic?: boolean;
	tags?: string[];
	files?: File[];
}

export interface DefinitionHistory {
	id: string;
	definitionId: string;
	content: string;
	tags: string[];
	mediaUrls: Array<{
		url: string;
		type: string;
		title?: string;
		description?: string;
		image?: string;
	}>;
	createdAt: string;
}
