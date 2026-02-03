import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PaginatedResponseDto, PaginationDto, User } from "@stashy/shared";
import { DefinitionsRepository } from "../definitions/definitions.repository";
import { Definition } from "../definitions/entities/definition.entity";
import { FollowsService } from "../follows/follows.service";
import { Word } from "../words/entities/word.entity";
import { WordsRepository } from "../words/words.repository";
import { UsersRepository } from "./users.repository";

export type CreateUserDto = {
  googleId: string;
  email: string;
  nickname: string;
  profilePicture?: string;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly wordRepository: WordsRepository,
    private readonly definitionRepository: DefinitionsRepository,
    private readonly followsService: FollowsService,
  ) {}

  async findByGoogleId(googleId: string): Promise<User | null> {
    return await this.userRepository.findByGoogleId(googleId);
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async create(data: CreateUserDto): Promise<User> {
    const result = await this.userRepository.insert(data);
    return result[0];
  }

  async updateNickname(userId: string, nickname: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

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
    return this.getProfileData(user);
  }

  async getUserByNickname(nickname: string) {
    const user = await this.userRepository.findByNickname(nickname);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async getUserProfileByNickname(nickname: string) {
    const user = await this.userRepository.findByNickname(nickname);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return this.getProfileData(user);
  }

  private async getProfileData(user: User) {
    const userId = user.id;
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
        bio: user.bio,
      },
      stats: {
        wordsCount: Number(wordsCount.count),
        definitionsCount: Number(definitionsCount.count),
        followersCount,
        followingCount,
      },
    };
  }

  async getUserPublicWords(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Word>> {
    const listQuery = this.wordRepository.findPublicByUserId(
      userId,
      paginationDto.limit || 20,
      paginationDto.cursor,
    );
    const words = await listQuery;
    const nextCursor = words.length > 0 ? (words[words.length - 1].createdAt as any) : undefined;

    return new PaginatedResponseDto<Word>(
      words,
      paginationDto.page || 1,
      paginationDto.limit || 20,
      nextCursor,
    );
  }
}
