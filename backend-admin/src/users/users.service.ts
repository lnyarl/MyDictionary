import { ConflictException, Injectable } from "@nestjs/common";
import { generateRandomNickname, User } from "@stashy/shared";
import {
  PaginatedResponseDto,
  PaginationDto,
} from "@stashy/shared/admin/dto/pagination.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UsersRepository) {}

  async getUsers(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<User>> {
    const { listQuery, countQuery } = await this.userRepository.findUsers(
      paginationDto.offset,
      paginationDto.limit,
    );
    const users = await listQuery;
    const totalResult = await countQuery;
    const total = totalResult ? totalResult.count : 0;

    return new PaginatedResponseDto<User>(
      users,
      total,
      paginationDto.page,
      paginationDto.limit,
    );
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingByEmail = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existingByEmail) {
      throw new ConflictException("Email is already registered");
    }

    const existingByNickname = await this.userRepository.findByNickname(
      createUserDto.nickname,
    );
    if (existingByNickname) {
      throw new ConflictException("Nickname is already taken");
    }

    return this.userRepository.insert({
      email: createUserDto.email,
      nickname: createUserDto.nickname,
      profilePicture: createUserDto.profilePicture,
    });
  }

  async createDummyUser(): Promise<User> {
    const nickname = generateRandomNickname();
    const email = `dummy_${nickname}_${Date.now()}@example.com`;

    return this.userRepository.insert({
      email,
      nickname,
      profilePicture: undefined,
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async suspendUser(id: string): Promise<User> {
    return this.userRepository.updateStatus(id, new Date());
  }

  async unsuspendUser(id: string): Promise<User> {
    return this.userRepository.updateStatus(id, null);
  }
}
