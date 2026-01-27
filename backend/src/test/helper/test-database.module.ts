import { Global, Module } from "@nestjs/common";
import knex, { Knex } from "knex";
import { patchKnex } from "../../common/database/knex.extention";
import { KNEX_CONNECTION } from "../../common/database/knex.provider";

patchKnex();

let testKnexInstance: Knex | null = null;

export function createTestKnexInstance() {
  const connectionConfig = {
    host: process.env.TEST_DB_HOST || "localhost",
    port: Number(process.env.TEST_DB_PORT) || 5433,
    user: process.env.TEST_DB_USERNAME || "postgres",
    password: process.env.TEST_DB_PASSWORD || "postgres",
    database: process.env.TEST_DB_DATABASE || "stashy_test",
  };
  if (!testKnexInstance) {
    testKnexInstance = knex({
      client: "pg",
      connection: connectionConfig,
      pool: {
        min: 1,
        max: 5,
      },
    });
  }
  return { instance: testKnexInstance, config: connectionConfig };
}

export async function destroyTestKnexInstance(): Promise<void> {
  if (testKnexInstance) {
    await testKnexInstance.destroy();
    testKnexInstance = null;
  }
}

export const testKnexProvider = {
  provide: KNEX_CONNECTION,
  useFactory: (): Knex => createTestKnexInstance().instance,
};

@Global()
@Module({
  providers: [testKnexProvider],
  exports: [testKnexProvider],
})
export class TestDatabaseModule {}
