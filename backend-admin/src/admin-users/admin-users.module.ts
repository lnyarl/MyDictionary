import { Module } from "@nestjs/common";
import { AdminUsersRepository } from "./admin-users.repository";
import { AdminUsersService } from "./admin-users.service";

@Module({
  providers: [AdminUsersService, AdminUsersRepository],
  exports: [AdminUsersService],
})
export class AdminUsersModule {}
