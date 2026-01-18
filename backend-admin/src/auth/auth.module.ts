import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { AdminUsersModule } from "../admin-users/admin-users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AdminJwtStrategy } from "./strategies/admin-jwt.strategy";

@Module({
  imports: [PassportModule, AdminUsersModule],
  controllers: [AuthController],
  providers: [AuthService, AdminJwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
