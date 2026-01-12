import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { PaginatedResponseDto, PaginationDto } from "../common/dto/pagination.dto";
import { Definition } from "../definitions/entities/definition.entity";
import { FollowsService } from "../follows/follows.service";
import { Word } from "../words/entities/word.entity";
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
		@InjectRepository(Word)
		private readonly wordRepository: Repository<Word>,
		@InjectRepository(Definition)
		private readonly definitionRepository: Repository<Definition>,
		private readonly followsService: FollowsService,
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

	async getUserProfile(userId: string) {
		const user = await this.findById(userId);
		if (!user) {
			throw new NotFoundException("User not found");
		}

		// Get counts
		const wordsCount = await this.wordRepository.count({
			where: { userId, isPublic: true },
		});

		const definitionsCount = await this.definitionRepository
			.createQueryBuilder("definition")
			.leftJoin("definition.word", "word")
			.where("definition.user_id = :userId", { userId })
			.andWhere("word.is_public = :isPublic", { isPublic: true })
			.getCount();

		const { followersCount, followingCount } =
			await this.followsService.getFollowStats(userId);

		return {
			user: {
				id: user.id,
				nickname: user.nickname,
				profilePicture: user.profilePicture,
				createdAt: user.createdAt,
			},
			stats: {
				wordsCount,
				definitionsCount,
				followersCount,
				followingCount,
			},
		};
	}

	async getUserPublicWords(
		userId: string,
		paginationDto: PaginationDto,
	): Promise<PaginatedResponseDto<Word>> {
		const [words, total] = await this.wordRepository.findAndCount({
			where: { userId, isPublic: true },
			order: { createdAt: "DESC" },
			skip: paginationDto.offset,
			take: paginationDto.limit,
		});

		return new PaginatedResponseDto<Word>(
			words,
			total,
			paginationDto.page,
			paginationDto.limit,
		);
	}

	async getUserPublicDefinitions(
		userId: string,
		paginationDto: PaginationDto,
	): Promise<PaginatedResponseDto<Definition>> {
		const queryBuilder = this.definitionRepository
			.createQueryBuilder("definition")
			.leftJoinAndSelect("definition.word", "word")
			.leftJoinAndSelect("definition.user", "user")
			.where("definition.user_id = :userId", { userId })
			.andWhere("word.is_public = :isPublic", { isPublic: true })
			.orderBy("definition.created_at", "DESC")
			.skip(paginationDto.offset)
			.take(paginationDto.limit);

		const [definitions, total] = await queryBuilder.getManyAndCount();

		return new PaginatedResponseDto<Definition>(
			definitions,
			total,
			paginationDto.page,
			paginationDto.limit,
		);
	}
}
