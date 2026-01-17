import type { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import knex, { type Knex } from "knex";

export const KNEX_CONNECTION = "KNEX_CONNECTION";

export const knexProvider: Provider = {
  provide: KNEX_CONNECTION,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): Knex => {
    return knex({
      client: "pg",
      connection: {
        host: configService.get("DB_HOST", "localhost"),
        port: configService.get("DB_PORT", 5432),
        user: configService.get("DB_USERNAME", "postgres"),
        password: configService.get("DB_PASSWORD", "postgres"),
        database: configService.get("DB_DATABASE", "mydictionary"),
      },
      pool: {
        min: 2,
        max: 10,
      },
      debug: configService.get("DB_LOGGING") === "true",
    });
  },
};
