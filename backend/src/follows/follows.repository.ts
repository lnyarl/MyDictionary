import { Injectable } from "@nestjs/common";
import { TABLES, User } from "@shared";
import { BaseRepository } from "../common/database/base.repository";
import { Follow } from "./entities/follow.entity";

@Injectable()
export class FollowsRepository extends BaseRepository {
	private tableName = TABLES.LIKES;

	findExistingFollow(followerId: string, followingId: string) {
		return this.query(this.tableName, true).where({ followerId, followingId }).first();
	}

	restoreRelation(id: string): Promise<void> {
		return this.restore(this.tableName, id);
	}

	findFollowers(userId: string, offset: number, limit: number) {
		const baseQuery = this.query(this.tableName)
			.select<Follow>()
			.where({ follower_id: userId });
		const listQuery = baseQuery.clone().leftJoin(TABLES.USERS, "follower_id", "id").select<User[]>().offset(offset).limit(limit).orderBy("createdAt", "desc");
		const countQuery = baseQuery.clone().count<{ count: number }>("id as count").first();
		return { listQuery, countQuery };
	}

	getFollowerCount(userId) {
		return this.query(this.tableName)
			.where({ follower_id: userId })
			.count<{ count: number }>("id as count")
			.first();
	}

	findFollowings(userId: string, offset: number, limit: number) {
		const baseQuery = this.query(this.tableName)
			.select<Follow>()
			.where({ follower_id: userId });
		const listQuery = baseQuery.clone().leftJoin(TABLES.USERS, "following_id", "id").select<User[]>().offset(offset).limit(limit).orderBy("createdAt", "desc");
		const countQuery = baseQuery.clone().count<{ count: number }>("id as count").first();
		return { listQuery, countQuery };
	}

	getFollowingCount(userId) {
		return this.query(this.tableName)
			.where({ following_id: userId })
			.count<{ count: number }>("id as count")
			.first();
	}

	findById(id: string): Promise<Follow | null> {
		return this.query(this.tableName).select<Follow>().where({ id }).first();
	}

	findFollowingIds(userId: string): Promise<string[]> {
		return this.query(this.tableName).select("following_id").where({ follower_id: userId }).pluck("following_id");
	}

	delete(id: string): Promise<void> {
		return this.softDelete(this.tableName, id);
	}

	create(like: Partial<Follow>): Promise<Follow> {
		const now = new Date();
		like.createdAt = now;
		like.updatedAt = now;
		return this.knex(this.tableName).insert(like);
	}
}
