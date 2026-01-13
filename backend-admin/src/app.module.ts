import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AdminUsersModule } from "./admin-users/admin-users.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { AdminJwtAuthGuard } from "./auth/guards/admin-jwt-auth.guard";
import { PasswordChangeRequiredGuard } from "./auth/guards/password-change-required.guard";
import ms from "ms";

@Module({
	imports: [
		// Environment configuration
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ".env",
		}),

		// Database configuration
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: "postgres",
				host: configService.get("DB_HOST", "localhost"),
				port: configService.get("DB_PORT", 5432),
				username: configService.get("DB_USERNAME", "postgres"),
				password: configService.get("DB_PASSWORD", "postgres"),
				database: configService.get("DB_DATABASE", "mydictionary"),
				entities: [__dirname + "/**/*.entity{.ts,.js}"],
				synchronize: configService.get("NODE_ENV") !== "production",
				logging: configService.get("NODE_ENV") === "development",
			}),
			inject: [ConfigService],
		}),

		// JWT module
		JwtModule.registerAsync({
			global: true,
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>("JWT_SECRET"),
				signOptions: {
					expiresIn: configService.get<ms.StringValue>("JWT_EXPIRES_IN", "8H"),
				},
			}),
			inject: [ConfigService],
		}),

		// Feature modules
		AdminUsersModule,
		AuthModule,
		UsersModule,
	],
	controllers: [AppController],
	providers: [
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
	],
})
export class AppModule { }
