import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginatedResponseDto, PaginationDto, User } from "@shared";
import type { Repository } from "typeorm";
import { Definition } from "../definitions/entities/definition.entity";
import { FollowsService } from "../follows/follows.service";
import { Word } from "../words/entities/word.entity";
import { WordsRepository } from "../words/words.repository";
import { UsersRepository } from "./users.repository";

export interface CreateUserDto {
	googleId: string;
	email: string;
	nickname: string;
	profilePicture?: string;
}

@Injectable()
export class UsersService {
	constructor(
		private readonly userRepository: UsersRepository,
		private readonly wordRepository: WordsRepository,
		@InjectRepository(Definition)
		private readonly definitionRepository: Repository<Definition>,
		private readonly followsService: FollowsService,
	) { }

	async findByGoogleId(googleId: string): Promise<User | null> {
		return this.userRepository.findByGoogleId(googleId);
	}

	async findById(id: string): Promise<User | null> {
		return this.userRepository.findById(id);
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.userRepository.findByEmail(email);
	}

	async create(data: CreateUserDto): Promise<User> {
		return this.userRepository.insert(data);
	}

	async updateNickname(userId: string, nickname: string): Promise<User> {
		// Check if user exists
		const user = await this.findById(userId);
		if (!user) {
			throw new NotFoundException("User not found");
		}

		// Check if nickname is already taken by another user
		const existingUser = await this.userRepository.findByNickname(nickname);

		if (existingUser && existingUser.id !== userId) {
			throw new ConflictException("Nickname is already taken");
		}

		const updated = await this.userRepository.updateNickname(userId, nickname);
		if (!updated) {
			throw new NotFoundException("User not found");
		}
		return updated;
	}

	async updateProfile(userId: string, updates: { email?: string; profilePicture?: string }): Promise<User> {
		const updated = await this.userRepository.updateEmailAndPicture(userId, updates);
		if (!updated) {
			throw new NotFoundException("User not found");
		}
		return updated;
	}

	async getUserProfile(userId: string) {
		const user = await this.findById(userId);
		if (!user) {
			throw new NotFoundException("User not found");
		}

		// Get counts
		const wordsCount = await this.wordRepository.countPublicByUserId(userId);

		const definitionsCount = await this.definitionRepository
			.createQueryBuilder("definition")
			.leftJoin("definition.word", "word")
			.where("definition.user_id = :userId", { userId })
			.andWhere("word.is_public = :isPublic", { isPublic: true })
			.getCount();

		const { followersCount, followingCount } = await this.followsService.getFollowStats(userId);

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

	async getUserPublicWords(userId: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<Word>> {
		const [words, total] = await this.wordRepository.findPublicByUserId(
			userId,
			paginationDto.limit,
			paginationDto.offset,
		);

		return new PaginatedResponseDto<Word>(words, total, paginationDto.page, paginationDto.limit);
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

		return new PaginatedResponseDto<Definition>(definitions, total, paginationDto.page, paginationDto.limit);
	}
}
