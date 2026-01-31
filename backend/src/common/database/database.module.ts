import { Global, Module } from "@nestjs/common";
import { patchKnex } from "./knex.extention";
import { knexProvider } from "./knex.provider";

patchKnex();

@Global()
@Module({
  providers: [knexProvider],
  exports: [knexProvider],
})
export class DatabaseModule {}
