import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Definition } from "../definitions/entities/definition.entity";
import { FollowsModule } from "../follows/follows.module";
import { FeedController } from "./feed.controller";
import { FeedService } from "./feed.service";

@Module({
	imports: [TypeOrmModule.forFeature([Definition]), FollowsModule],
	controllers: [FeedController],
	providers: [FeedService],
	exports: [FeedService],
})
export class FeedModule { }
