import { Injectable } from "@nestjs/common";
import { TABLES } from "@shared";
import { BaseRepository } from "../common/database/base.repository";
import { Like } from "./entities/like.entity";

@Injectable()
export class LikesRepository extends BaseRepository {
	private tableName = TABLES.LIKES;

	/**
	 * Find all words by user ID
	 */
	findByUserIdAndDefinitionId(userId: string, definitionId: string): Promise<Like> {
		return this.query(this.tableName).select<Like>().where(
			{ userId, definitionId },
		).first();
	}

	findByDefinitionId(definitionId: string): Promise<Like[]> {
		return this.query(this.tableName).select<Like[]>().where(
			{ definitionId },
		);
	}

	delete(id: string): Promise<void> {
		return this.softDelete(this.tableName, id);
	}

	create(like: Partial<Like>): Promise<Like> {
		const now = new Date();
		like.createdAt = now;
		like.updatedAt = now;
		return this.knex(this.tableName).insert(like);
	}
}
