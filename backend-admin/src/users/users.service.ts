import { ConflictException, Injectable } from "@nestjs/common";
import { generateRandomNickname } from "@stashy/shared";
import {
  PaginatedResponseDto,
  PaginationDto,
} from "@stashy/shared/admin/dto/pagination.dto";
import { CreateUserDto } from "@stashy/shared/admin/dto/user/create-user.dto";
import { Users } from "@stashy/shared/types/db_entity.generated";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UsersRepository) {}

  async getUsers(paginationDto: PaginationDto) {
    const { listQuery, countQuery } = await this.userRepository.findUsers(
      paginationDto.offset,
      paginationDto.limit,
    );
    const users = await listQuery;
    const totalResult = await countQuery;
    const total = totalResult ? totalResult.count : 0;

    return new PaginatedResponseDto<Users>(
      users,
      total,
      paginationDto.page,
      paginationDto.limit,
    );
  }

  async createUser(createUserDto: CreateUserDto) {
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

    return await this.userRepository.insert({
      email: createUserDto.email,
      nickname: createUserDto.nickname,
      profilePicture: createUserDto.profilePicture,
    });
  }

  async createDummyUser() {
    const nickname = generateRandomNickname();
    const email = `dummy_${nickname}_${Date.now()}@example.com`;

    return await this.userRepository.insert({
      email,
      nickname,
      profilePicture: undefined,
    });
  }

  async getUserById(id: string) {
    return await this.userRepository.findById(id);
  }

  async suspendUser(id: string) {
    return await this.userRepository.updateStatus(id, new Date());
  }

  async unsuspendUser(id: string) {
    return await this.userRepository.updateStatus(id, null);
  }
}
