export interface Definition {
	id: string;
	content: string;
	wordId: string;
	userId: string;
	term: string;
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
	tags?: string[];
	files?: File[];
}
