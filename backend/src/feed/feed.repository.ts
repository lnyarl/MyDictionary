import { Injectable } from "@nestjs/common";
import { TABLES, } from "@shared";
import { BaseRepository } from "../common/database/base.repository";
import { Feed } from "./entities/feed.entity";

@Injectable()
export class FeedRepository extends BaseRepository {
	findFeeds(userIds: string[], offset: number, limit: number) {
		return this.query(TABLES.DEFINITIONS)
			.leftJoin(TABLES.USERS, "definitions.user_id", "users.id")
			.leftJoin(TABLES.WORDS, "definitions.word_id", "words.id")
			.whereIn("definitions.user_id", userIds)
			.andWhere("words.deleted_at", null)
			.andWhere("word.is_public", true)
			.limit(limit)
			.offset(offset)
			.orderBy("definitions.created_at", "desc")
			.select<Feed[]>();
	}
}
