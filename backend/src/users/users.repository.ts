import { Injectable } from "@nestjs/common";
import { TABLES, User } from "@shared";
import { BaseRepository } from "../common/database/base.repository";

@Injectable()
export class UsersRepository extends BaseRepository {
	private tableName = TABLES.USERS;

	async findById(id: string): Promise<User | null> {
		return await this.query(this.tableName).select<User>().where({ id }).first();
	}

	async findByGoogleId(googleId: string): Promise<User | null> {
		return await this.query(this.tableName).select<User>().where({ googleId }).first();
	}

	async findByEmail(email: string): Promise<User | null> {
		return await this.query(this.tableName).select<User>().where({ email }).first();
	}

	async findByNickname(nickname: string): Promise<User | null> {
		return await this.query(this.tableName).select<User>().where({ nickname }).first();
	}

	async updateNickname(userId: string, nickname: string): Promise<User> {
		const [result] = await this.knex(this.tableName).update({ nickname }).where({ id: userId }).returning("*");;
		return result;
	}

	async updateEmailAndPicture(userId: string, updates: { email?: string, profilePicture?: string }): Promise<User> {
		const [result] = await this.knex(this.tableName).update(updates).where({ id: userId }).returning("*");;
		return result;
	}

	async insert(data: Partial<User>): Promise<User> {
		const now = new Date();
		return await this.knex(this.tableName).insert({
			...data,
			created_at: now,
			updated_at: now,
		});
	}
}
