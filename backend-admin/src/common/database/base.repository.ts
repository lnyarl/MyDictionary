import { Inject, Injectable } from "@nestjs/common";
import type { DBTableMap, DBTableNames } from "@stashy/shared";
import type { Knex } from "knex";
import { KNEX_CONNECTION } from "./knex.provider";

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface FindOptions {
  withDeleted?: boolean;
  orderBy?: { column: string; order: "asc" | "desc" };
  select?: string[];
}

export interface PaginationOptions extends FindOptions {
  limit: number;
  offset: number;
}

@Injectable()
export abstract class BaseRepository {
  constructor(@Inject(KNEX_CONNECTION) protected readonly knex: Knex) {}

  /**
   * Get base query with soft delete filtering
   */
  protected query<K extends DBTableNames>(
    tableName: K,
    withDeleted = false,
  ): Knex.QueryBuilder {
    const query = this.knex(tableName);
    if (!withDeleted) {
      query.whereNull(`${tableName}.deleted_at`);
    }
    return query;
  }

  protected getPrimary<K extends DBTableNames>(tableName: K) {
    return this.knex<DBTableMap[K]>(tableName);
  }

  /**
   * Soft delete a record
   */
  protected async softDelete(
    tableName: DBTableNames,
    id: string,
  ): Promise<void> {
    await this.knex(tableName).where({ id }).whereNull("deleted_at").update({
      deleted_at: new Date(),
      updated_at: new Date(),
    });
  }

  /**
   * Restore a soft-deleted record
   */
  protected async restore(tableName: DBTableNames, id: string): Promise<void> {
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
  async transaction<R>(
    callback: (trx: Knex.Transaction) => Promise<R>,
  ): Promise<R> {
    return this.knex.transaction(callback);
  }
}
