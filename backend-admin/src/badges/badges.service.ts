import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateBadgeDto, UpdateBadgeDto } from "@stashy/shared";
import {
  PaginatedResponseDto,
  PaginationDto,
} from "@stashy/shared/admin/dto/pagination.dto";
import { Badges } from "@stashy/shared/types/db_entity.generated";
import { BadgesRepository } from "./badges.repository";

@Injectable()
export class BadgesService {
  constructor(private readonly badgesRepository: BadgesRepository) {}

  async findAll(paginationDto: PaginationDto) {
    const { listQuery, countQuery } = await this.badgesRepository.findAll(
      paginationDto.offset,
      paginationDto.limit,
    );
    const badges = await listQuery;
    const totalResult = await countQuery;
    const total = totalResult ? Number(totalResult.count) : 0;

    return new PaginatedResponseDto<Badges>(
      badges,
      total,
      paginationDto.page,
      paginationDto.limit,
    );
  }

  async findOne(id: string) {
    const badge = await this.badgesRepository.findById(id);
    if (!badge) {
      throw new NotFoundException("Badge not found");
    }
    return badge;
  }

  async create(createBadgeDto: CreateBadgeDto) {
    return this.badgesRepository.create(createBadgeDto);
  }

  async update(id: string, updateBadgeDto: UpdateBadgeDto) {
    await this.findOne(id);
    return this.badgesRepository.updateBadge(id, updateBadgeDto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.badgesRepository.deleteBadge(id);
  }

  async getUserBadges(userId: string) {
    return this.badgesRepository.findUserBadges(userId);
  }

  async grantBadge(userId: string, badgeId: string) {
    const hasBadge = await this.badgesRepository.hasBadge(userId, badgeId);
    if (hasBadge) {
      throw new ConflictException("User already has this badge");
    }
    return this.badgesRepository.grantBadge(userId, badgeId);
  }

  async revokeBadge(userId: string, badgeId: string) {
    return this.badgesRepository.revokeBadge(userId, badgeId);
  }
}
