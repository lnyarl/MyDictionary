import { Injectable, Scope } from "@nestjs/common";
import { generateId } from "@stashy/shared";
import { Users } from "@stashy/shared/types/db_entity.generated";
import { BaseRepository } from "../common/database/base.repository";
import { Follow, FollowSelect } from "./entities/follow.entity";

@Injectable({ scope: Scope.TRANSIENT })
export class FollowsRepository extends BaseRepository {
  findExistingFollow(followerId: string, followingId: string) {
    return this.query("follows", true)
      .select<Follow>(FollowSelect)
      .where({ follower_id: followerId, following_id: followingId })
      .first();
  }

  restoreRelation(id: string): Promise<void> {
    return this.undelete("follows", id);
  }

  findFollowers(userId: string, limit: number, cursor?: string) {
    const baseQuery = this.query("follows").where({ following_id: userId });

    if (cursor) {
      baseQuery.where(`follows.created_at`, "<", new Date(Number(cursor)));
    }

    const listQuery = baseQuery
      .clone()
      .leftJoin("users", `follows.follower_id`, `users.id`)
      .select<(Users & { followCreatedAt: Date })[]>({
        id: "users.id",
        googleId: "users.google_id",
        email: "users.email",
        nickname: "users.nickname",
        bio: "users.bio",
        profilePicture: "users.profile_picture",
        createdAt: "users.created_at",
        updatedAt: "users.updated_at",
        deletedAt: "users.deleted_at",
        suspendedAt: "users.suspended_at",
        followCreatedAt: "follows.created_at",
      })
      .limit(limit)
      .orderBy(`follows.created_at`, "desc");

    return listQuery;
  }

  getFollowerCount(userId) {
    return this.query("follows")
      .where({ following_id: userId })
      .count<{ count: number }>("id as count")
      .first();
  }

  findFollowings(userId: string, limit: number, cursor?: string) {
    const baseQuery = this.query("follows").where({ follower_id: userId });

    if (cursor) {
      baseQuery.where(`follows.created_at`, "<", cursor);
    }

    const listQuery = baseQuery
      .clone()
      .leftJoin("users", `follows.following_id`, `users.id`)
      .select<(Users & { followCreatedAt: Date })[]>({
        id: "users.id",
        googleId: "users.google_id",
        email: "users.email",
        nickname: "users.nickname",
        bio: "users.bio",
        profilePicture: "users.profile_picture",
        createdAt: "users.created_at",
        updatedAt: "users.updated_at",
        deletedAt: "users.deleted_at",
        suspendedAt: "users.suspended_at",
        followCreatedAt: "follows.created_at",
      })
      .limit(limit)
      .orderBy("follows.created_at", "desc");
    return listQuery;
  }

  getFollowingCount(userId) {
    return this.query("follows")
      .where({ follower_id: userId })
      .count<{ count: number }>("id as count")
      .first();
  }

  findById(id: string) {
    return this.query("follows").select<Follow>(FollowSelect).where({ id }).first();
  }

  findFollowingIds(userId: string) {
    return this.query("follows")
      .select("following_id")
      .where({ follower_id: userId })
      .pluck("following_id");
  }

  findFollowerIds(userId: string) {
    return this.query("follows")
      .select("follower_id")
      .where({ following_id: userId })
      .pluck("follower_id");
  }
  
  createFollow({ followerId, followingId }: { followerId: string; followingId: string }) {
    return this.knex("follows")
      .insert({
        id: generateId(),
        follower_id: followerId,
        following_id: followingId,
      })
      .returning<Follow[]>([
        "id",
        "follower_id as followerId",
        "following_id as followingId",
        "created_at as createdAt",
        "updated_at as updatedAt",
        "deleted_at as deletedAt",
      ]);
  }

  deleteFollow(id: string) {
    return this.softDelete("follows", id);
  }
}
