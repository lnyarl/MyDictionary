import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Definition } from "../definitions/entities/definition.entity";
import { Like } from "./entities/like.entity";
import { LikesController } from "./likes.controller";
import { LikesService } from "./likes.service";

@Module({
	imports: [TypeOrmModule.forFeature([Like, Definition])],
	controllers: [LikesController],
	providers: [LikesService],
	exports: [LikesService],
})
export class LikesModule {}
