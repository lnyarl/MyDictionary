import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PaginatedResponseDto, PaginationDto, User } from "@shared";
import { DefinitionsRepository } from "../definitions/definitions.repository";
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
    private readonly definitionRepository: DefinitionsRepository,
    private readonly followsService: FollowsService,
  ) {}

  async findByGoogleId(googleId: string): Promise<User | null> {
    console.log("====", this.userRepository.findByGoogleId(googleId).toQuery());
    return await this.userRepository.findByGoogleId(googleId);
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async create(data: CreateUserDto): Promise<User> {
    return await this.userRepository.insert(data);
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

  async updateProfile(
    userId: string,
    updates: { nickname?: string; bio?: string; profilePicture?: string },
  ): Promise<User> {
    if (updates.nickname) {
      const existingUser = await this.userRepository.findByNickname(updates.nickname);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException("Nickname is already taken");
      }
    }

    const updated = await this.userRepository.updateProfile(userId, updates);
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

    const wordsCountQuery = this.wordRepository.countPublicByUserId(userId);
    const definitionsCountQuery = this.definitionRepository.getCountByUserId(userId);
    const followResult = this.followsService.getFollowStats(userId);
    const [wordsCount, definitionsCount, { followersCount, followingCount }] = await Promise.all([
      wordsCountQuery,
      definitionsCountQuery,
      followResult,
    ]);

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
    const { listQuery, countQuery } = this.wordRepository.findPublicByUserId(
      userId,
      paginationDto.limit,
      paginationDto.offset,
    );
    const [words, total] = await Promise.all([listQuery, countQuery]);

    return new PaginatedResponseDto<Word>(
      words,
      total.count,
      paginationDto.page,
      paginationDto.limit,
    );
  }

  async getUserPublicDefinitions(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Definition>> {
    const { listQuery, countQuery } = this.definitionRepository.findByUserId(
      userId,
      paginationDto.offset,
      paginationDto.limit,
    );
    const [definitions, total] = await Promise.all([listQuery, countQuery]);

    return new PaginatedResponseDto<Definition>(
      definitions,
      total.count,
      paginationDto.page,
      paginationDto.limit,
    );
  }
}
