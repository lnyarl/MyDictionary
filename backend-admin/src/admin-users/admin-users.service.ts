import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AdminUser } from "./entities/admin-user.entity";

@Injectable()
export class AdminUsersService {
	constructor(
		@InjectRepository(AdminUser)
		private readonly adminUserRepository: Repository<AdminUser>,
	) {}

	async findByUsername(username: string): Promise<AdminUser | null> {
		return this.adminUserRepository.findOne({ where: { username } });
	}

	async findById(id: string): Promise<AdminUser | null> {
		return this.adminUserRepository.findOne({ where: { id } });
	}

	async updatePassword(
		adminId: string,
		hashedPassword: string,
	): Promise<AdminUser> {
		const admin = await this.findById(adminId);
		if (!admin) {
			throw new NotFoundException("Admin user not found");
		}

		admin.password = hashedPassword;
		admin.mustChangePassword = false;
		return this.adminUserRepository.save(admin);
	}

	async updateLastLogin(adminId: string): Promise<void> {
		await this.adminUserRepository.update(adminId, {
			lastLogin: new Date(),
		});
	}
}
