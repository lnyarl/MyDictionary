import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { User } from "./entities/user.entity";

export interface CreateUserDto {
	googleId: string;
	email: string;
	nickname: string;
	profilePicture?: string;
}

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	async findByGoogleId(googleId: string): Promise<User | null> {
		return this.userRepository.findOne({ where: { googleId } });
	}

	async findById(id: string): Promise<User | null> {
		return this.userRepository.findOne({ where: { id } });
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.userRepository.findOne({ where: { email } });
	}

	async create(data: CreateUserDto): Promise<User> {
		const user = this.userRepository.create(data);
		return this.userRepository.save(user);
	}

	async updateNickname(userId: string, nickname: string): Promise<User> {
		// Check if user exists
		const user = await this.findById(userId);
		if (!user) {
			throw new NotFoundException("User not found");
		}

		// Check if nickname is already taken by another user
		const existingUser = await this.userRepository.findOne({
			where: { nickname },
		});

		if (existingUser && existingUser.id !== userId) {
			throw new ConflictException("Nickname is already taken");
		}

		await this.userRepository.update(userId, { nickname });
		return this.findById(userId);
	}

	async updateProfile(
		userId: string,
		updates: { email?: string; profilePicture?: string },
	): Promise<User> {
		await this.userRepository.update(userId, updates);
		return this.findById(userId);
	}
}
