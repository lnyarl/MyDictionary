import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DefinitionsModule } from "src/definitions/definitions.module";
import { Definition } from "src/definitions/entities/definition.entity";
import { WordsController } from "./words.controller";
import { WordsService } from "./words.service";
import { WordsRepository } from "./words.repository";

@Module({
	imports: [
		TypeOrmModule.forFeature([Definition]), // Keep TypeORM for Definition
		DefinitionsModule,
	],
	providers: [WordsService, WordsRepository],
	controllers: [WordsController],
	exports: [WordsService, WordsRepository],
})
export class WordsModule {}
