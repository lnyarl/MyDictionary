import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { knexProvider } from "./common/database/knex.provider";
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
    knexProvider,
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
