import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Word } from "../words/entities/word.entity";
import { DefinitionsController } from "./definitions.controller";
import { DefinitionsService } from "./definitions.service";
import { Definition } from "./entities/definition.entity";

@Module({
	imports: [TypeOrmModule.forFeature([Definition, Word, User])],
	controllers: [DefinitionsController],
	providers: [DefinitionsService],
	exports: [DefinitionsService],
})
export class DefinitionsModule { }
