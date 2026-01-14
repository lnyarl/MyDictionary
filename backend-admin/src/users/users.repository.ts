import { Injectable } from "@nestjs/common";
import { TABLES, User } from "@shared";
import { BaseRepository } from "../common/database/base.repository";

@Injectable()
export class UsersRepository extends BaseRepository {
  private tableName = TABLES.USERS;

  findUsers(offset: number, limit: number) {
    const baseQuery = this.knex(this.tableName).select<User[]>({
      id: "id",
      email: "email",
      nickname: "nickname",
      profilePicture: "profile_picture",
      createdAt: "created_at",
      updatedAt: "updated_at",
    });
    const listQuery = baseQuery.clone().offset(offset).limit(limit).orderBy("created_at", "desc");
    const countQuery = baseQuery.clone().count<{ count: number }>("* as count").first();
    return { listQuery, countQuery };
  }
}
