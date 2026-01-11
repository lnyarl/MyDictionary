import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DefinitionsModule } from "src/definitions/definitions.module";
import { Definition } from "src/definitions/entities/definition.entity";
import { User } from "../users/entities/user.entity";
import { Word } from "./entities/word.entity";
import { WordsController } from "./words.controller";
import { WordsService } from "./words.service";

@Module({
	imports: [TypeOrmModule.forFeature([Word, User, Definition]), DefinitionsModule],
	providers: [WordsService],
	controllers: [WordsController],
	exports: [WordsService],
})
export class WordsModule { }
