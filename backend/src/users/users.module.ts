import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Definition } from "../definitions/entities/definition.entity";
import { FollowsModule } from "../follows/follows.module";
import { Word } from "../words/entities/word.entity";
import { User } from "./entities/user.entity";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Word, Definition]),
		FollowsModule,
	],
	providers: [UsersService],
	controllers: [UsersController],
	exports: [UsersService],
})
export class UsersModule {}
