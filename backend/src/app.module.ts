import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { DefinitionsModule } from "./definitions/definitions.module";
import { FeedModule } from "./feed/feed.module";
import { FollowsModule } from "./follows/follows.module";
import { LikesModule } from "./likes/likes.module";
import { UsersModule } from "./users/users.module";
import { WordsModule } from "./words/words.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ".env",
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: "postgres",
				host: configService.get("DB_HOST", "localhost"),
				port: configService.get("DB_PORT", 5432),
				username: configService.get("DB_USERNAME", "postgres"),
				password: configService.get("DB_PASSWORD", "postgres"),
				database: configService.get("DB_DATABASE", "mydictionary"),
				entities: [`${__dirname}/**/*.entity{.ts,.js}`],
				synchronize: configService.get("NODE_ENV") !== "production",
				logging: configService.get("NODE_ENV") === "development",
			}),
			inject: [ConfigService],
		}),
		UsersModule,
		AuthModule,
		WordsModule,
		DefinitionsModule,
		LikesModule,
		FollowsModule,
		FeedModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
	],
})
export class AppModule {}
