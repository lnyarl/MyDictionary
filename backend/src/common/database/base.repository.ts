import { Inject, Injectable } from "@nestjs/common";
import { TableName } from "@shared";
import { Knex } from "knex";
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
  constructor(@Inject(KNEX_CONNECTION) protected readonly knex: Knex) { }

  public withTransaction<T extends typeof this>(trx?: Knex.Transaction): T {
    const repo = Object.create(this);
    if (trx) {
      repo.knex = repo.knex.transacting(trx);
    }
    return repo;
  }

  /**
   * Get base query with soft delete filtering
   */
  protected query(tableName: string | Knex.AliasDict, withDeleted = false): Knex.QueryBuilder {
    const query = this.knex(tableName);
    if (!withDeleted) {
      const resolvedTableName =
        typeof tableName === "string" ? tableName : Object.keys(tableName)[0];
      query.whereNull(`${resolvedTableName}.deleted_at`);
    }
    return query;
  }

  /**
   * Update a record by ID
   */
  protected async update<T>(tableName: TableName, id: string, data: any): Promise<T | null> {
    const [record] = await this.knex(tableName)
      .where({ id })
      .whereNull("deleted_at")
      .update({
        ...data,
        updated_at: new Date(),
      })
      .returning("*");

    return record ?? null;
  }

  /**
   * Soft delete a record
   */
  protected async softDelete(tableName: TableName, id: string): Promise<void> {
    await this.knex(tableName).where({ id }).whereNull("deleted_at").update({
      deleted_at: new Date(),
      updated_at: new Date(),
    });
  }

  /**
   * Restore a soft-deleted record
   */
  protected async restore(tableName: TableName, id: string): Promise<void> {
    await this.knex(tableName).where({ id }).whereNotNull("deleted_at").update({
      deleted_at: null,
      updated_at: new Date(),
    });
  }

  /**
   * Hard delete a record
   */
  protected async delete(tableName: TableName, id: string): Promise<void> {
    await this.knex(tableName).where({ id }).delete();
  }

  /**
   * Begin a transaction
   */
  transaction<R>(callback: (trx: Knex.Transaction) => Promise<R>): Promise<R> {
    return this.knex.transaction(callback);
  }
}
