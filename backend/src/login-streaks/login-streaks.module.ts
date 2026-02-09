import { Module } from "@nestjs/common";
import { LoginStreaksRepository } from "./login-streaks.repository";
import { LoginStreaksService } from "./login-streaks.service";

@Module({
  providers: [LoginStreaksService, LoginStreaksRepository],
  exports: [LoginStreaksService],
})
export class LoginStreaksModule {}
