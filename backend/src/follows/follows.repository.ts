import { Injectable } from "@nestjs/common";
import { TABLES, User } from "@shared";
import { UserSelect } from "@shared/entities/user.entity";
import { BaseRepository } from "../common/database/base.repository";
import { Follow, FollowSelect } from "./entities/follow.entity";

@Injectable()
export class FollowsRepository extends BaseRepository {
  private tableName = TABLES.FOLLOWS;

  findExistingFollow(followerId: string, followingId: string) {
    return this.query(this.tableName, true)
      .select<Follow>(FollowSelect)
      .where({ follower_id: followerId, following_id: followingId })
      .first();
  }

  restoreRelation(id: string): Promise<void> {
    return this.restore(this.tableName, id);
  }

  findFollowers(userId: string, offset: number, limit: number) {
    const baseQuery = this.query(this.tableName).where({ follower_id: userId });
    const listQuery = baseQuery
      .clone()
      .leftJoin(TABLES.USERS, `${TABLES.FOLLOWS}.follower_id`, `${TABLES.USERS}.id`)
      .select<User[]>(
        Object.keys(UserSelect).reduce((acc, key) => {
          acc[key] = `${TABLES.USERS}.${UserSelect[key]}`;
          return acc;
        }, {}),
      )
      .offset(offset)
      .limit(limit)
      .orderBy(`${TABLES.FOLLOWS}.created_at`, "desc");
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
    const baseQuery = this.query(this.tableName).where({ follower_id: userId });
    const listQuery = baseQuery
      .clone()
      .leftJoin(TABLES.USERS, `${TABLES.FOLLOWS}.following_id`, `${TABLES.USERS}.id`)
      .select<User[]>(
        Object.keys(UserSelect).reduce((acc, key) => {
          acc[key] = `${TABLES.USERS}.${UserSelect[key]}`;
          return acc;
        }, {}),
      )
      .offset(offset)
      .limit(limit)
      .orderBy(`${TABLES.FOLLOWS}.created_at`, "desc");
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
    return this.query(this.tableName).select<Follow>(FollowSelect).where({ id }).first();
  }

  findFollowingIds(userId: string): Promise<string[]> {
    return this.query(this.tableName)
      .select("following_id")
      .where({ follower_id: userId })
      .pluck("following_id");
  }

  delete(id: string): Promise<void> {
    return this.softDelete(this.tableName, id);
  }

  create(follow: Partial<Follow>): Promise<Follow> {
    const now = new Date();
    return this.knex(this.tableName).insert({
      id: follow.id,
      follower_id: follow.followerId,
      following_id: follow.followingId,
      created_at: now,
      updated_at: now,
    });
  }
}
