import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminUsersService } from "./admin-users.service";
import { AdminUser } from "./entities/admin-user.entity";

@Module({
	imports: [TypeOrmModule.forFeature([AdminUser])],
	providers: [AdminUsersService],
	exports: [AdminUsersService],
})
export class AdminUsersModule {}
