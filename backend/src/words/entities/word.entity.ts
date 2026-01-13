import { Definition } from "../../definitions/entities/definition.entity";
import { User } from "@shared";

// Plain class without TypeORM decorators (for Knex compatibility)
export class Word {
	id: string;
	term: string;
	userId: string;
	isPublic: boolean;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;

	// Relations (populated manually when needed)
	user?: User;
	definitions?: Definition[];
}

// For database inserts
export type WordInsert = Omit<
	Word,
	"id" | "createdAt" | "updatedAt" | "deletedAt" | "user" | "definitions"
> & {
	id?: string;
	isPublic?: boolean;
	createdAt?: Date;
	updatedAt?: Date;
	deletedAt?: Date | null;
};

// For database updates
export type WordUpdate = Partial<
	Omit<Word, "id" | "createdAt" | "deletedAt" | "user" | "definitions">
>;
