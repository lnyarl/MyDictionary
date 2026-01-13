import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Definition } from "../definitions/entities/definition.entity";
import { FollowsModule } from "../follows/follows.module";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { UsersRepository } from "./users.repository";
import { WordsRepository } from "../words/words.repository";

@Module({
	imports: [
		TypeOrmModule.forFeature([Definition]), // Keep TypeORM for Definition
		FollowsModule,
	],
	providers: [UsersService, UsersRepository, WordsRepository],
	controllers: [UsersController],
	exports: [UsersService, UsersRepository],
})
export class UsersModule {}
