import "./type.generated";
import { Inject, Injectable } from "@nestjs/common";
import { DBTableNames } from "@stashy/shared";
import { Knex } from "knex";
import { KNEX_CONNECTION } from "./knex.provider";

export type BaseEntity = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type FindOptions = {
  withDeleted?: boolean;
  orderBy?: { column: string; order: "asc" | "desc" };
  select?: string[];
};

export type PaginationOptions = FindOptions & {
  limit: number;
  offset: number;
};

@Injectable()
export abstract class BaseRepository {
  constructor(@Inject(KNEX_CONNECTION) protected knex: Knex) {}

  /**
   * Get base query with soft delete filtering
   */
  protected query<K extends DBTableNames>(
    tableName: K | `${K} as ${string}`,
    withDeleted = false,
  ): Knex.QueryBuilder {
    const query = this.knex(tableName);
    if (!withDeleted) {
      const resolvedTableName = tableName.includes(" as ") ? tableName.split(" as ")[1] : tableName;
      query.whereNull(`${resolvedTableName}.deleted_at`);
    }
    return query;
  }

  /**
   * Soft delete a record
   */
  protected async softDelete(tableName: DBTableNames, id: string): Promise<void> {
    await this.knex(tableName).where({ id }).whereNull("deleted_at").update({
      deleted_at: new Date(),
      updated_at: new Date(),
    });
  }

  /**
   * Restore a soft-deleted record
   */
  protected async undelete(tableName: DBTableNames, id: string): Promise<void> {
    await this.knex(tableName).where({ id }).whereNotNull("deleted_at").update({
      deleted_at: null,
      updated_at: new Date(),
    });
  }

  /**
   * Hard delete a record
   */
  protected async delete(tableName: DBTableNames, id: string): Promise<void> {
    await this.knex(tableName).where({ id }).delete();
  }

  /**
   * Begin a transaction
   */
  transaction<R>(callback: (trx: Knex.Transaction) => Promise<R>): Promise<R> {
    return this.knex.transaction(callback);
  }
}
