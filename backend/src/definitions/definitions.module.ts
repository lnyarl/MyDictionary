import { Module } from "@nestjs/common";
import { knexProvider } from "../common/database/knex.provider";
import { DefinitionsController } from "./definitions.controller";
import { DefinitionsService } from "./definitions.service";

@Module({
  controllers: [DefinitionsController],
  providers: [knexProvider, DefinitionsService],
  exports: [DefinitionsService],
})
export class DefinitionsModule {}
