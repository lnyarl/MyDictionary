import knex, { Knex } from "knex";

export const withTransaction = (queryBuilder: Knex.QueryBuilder, trx?: Knex.Transaction) => {
  if (!trx) return queryBuilder;
  return queryBuilder.transacting(trx);
};

declare module "knex" {
  namespace Knex {
    interface QueryBuilder {
      maybeTransacting(trx?: Knex.Transaction): this;
    }
  }
}
export const patchKnex = () => {
  try {
    knex.QueryBuilder.extend("maybeTransacting", function (trx?: Knex.Transaction) {
      return trx ? this.transacting(trx) : this;
    });
  } catch {
    // ignore
  }
};
