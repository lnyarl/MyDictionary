import { Module } from "@nestjs/common";
import { DefinitionHistoriesRepository } from "./definition-histories.repository";

@Module({
  providers: [DefinitionHistoriesRepository],
  exports: [DefinitionHistoriesRepository],
})
export class DefinitionHistoriesModule {}
