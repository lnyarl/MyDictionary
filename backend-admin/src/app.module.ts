import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import ms from "ms";
import { AdminUsersModule } from "./admin-users/admin-users.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { AdminJwtAuthGuard } from "./auth/guards/admin-jwt-auth.guard";
import { PasswordChangeRequiredGuard } from "./auth/guards/password-change-required.guard";
import { RolesGuard } from "./auth/guards/roles.guard";
import { BadgesModule } from "./badges/badges.module";
import { DatabaseModule } from "./common/database/database.module";
import { knexProvider } from "./common/database/knex.provider";
import { ReportsModule } from "./reports/reports.module";
import { UsersModule } from "./users/users.module";
import { WordsModule } from "./words/words.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    // ...
    DatabaseModule,
    // Feature modules
    AdminUsersModule,
    AuthModule,
    UsersModule,
    WordsModule,
    ReportsModule,
    BadgesModule,
  ],

  controllers: [AppController],
  providers: [
    knexProvider,
    AppService,
    // Global guards
    {
      provide: APP_GUARD,
      useClass: AdminJwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PasswordChangeRequiredGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
