import * as path from "node:path";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from "nestjs-i18n";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { BadgesModule } from "./badges/badges.module";
import { CacheModule } from "./common/cache/cache.module";
import { CommonModule } from "./common/common.module";
import { DatabaseModule } from "./common/database/database.module";
import { knexProvider } from "./common/database/knex.provider";
import { EventsModule } from "./common/events/events.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { SuspendedUserGuard } from "./common/guards/suspended-user.guard";
import { DefinitionsModule } from "./definitions/definitions.module";
import { FeedModule } from "./feed/feed.module";
import { FollowsModule } from "./follows/follows.module";
import { LikesModule } from "./likes/likes.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { ReportsModule } from "./reports/reports.module";
import { UsersModule } from "./users/users.module";
import { WordsModule } from "./words/words.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    I18nModule.forRoot({
      fallbackLanguage: "ko",
      loaderOptions: {
        path: path.join(
          process.cwd(),
          process.env.NODE_ENV === "production" ? "backend/dist/i18n/" : "src/i18n/",
        ),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ["lang"] },
        AcceptLanguageResolver,
        new HeaderResolver(["x-custom-lang"]),
      ],
    }),
    CacheModule,
    CommonModule,
    DatabaseModule,
    EventsModule,
    UsersModule,
    AuthModule,
    WordsModule,
    DefinitionsModule,
    LikesModule,
    FollowsModule,
    FeedModule,
    NotificationsModule,
    BadgesModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    knexProvider,
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: SuspendedUserGuard,
    },
  ],
})
export class AppModule {}
