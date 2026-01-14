import { Injectable } from "@nestjs/common";
import { PaginatedResponseDto, PaginationDto, User } from "@shared";
import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UsersRepository) {}

  async getUsers(paginationDto: PaginationDto): Promise<PaginatedResponseDto<User>> {
    const { listQuery, countQuery } = await this.userRepository.findUsers(
      paginationDto.offset,
      paginationDto.limit,
    );
    const users = await listQuery;
    const totalResult = await countQuery;
    const total = totalResult ? totalResult.count : 0;

    return new PaginatedResponseDto<User>(users, total, paginationDto.page, paginationDto.limit);
  }
}
