// Plain class without TypeORM decorators (for Knex compatibility)
export class User {
	id: string;
	googleId: string;
	email: string;
	nickname: string;
	profilePicture: string | null;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
}

// For database inserts (optional fields)
export type UserInsert = Omit<
	User,
	"id" | "createdAt" | "updatedAt" | "deletedAt"
> & {
	id?: string;
	profilePicture?: string | null;
	createdAt?: Date;
	updatedAt?: Date;
	deletedAt?: Date | null;
};

// For database updates
export type UserUpdate = Partial<
	Omit<User, "id" | "createdAt" | "deletedAt">
>;
