import { Injectable } from "@nestjs/common";
import { PaginatedResponseDto, SearchTermDto, TermResponseDto } from "@stashy/shared";
import { TermsRepository } from "./terms.repository";

@Injectable()
export class TermsService {
  constructor(private readonly termsRepository: TermsRepository) {}

  async search(searchTermDto: SearchTermDto): Promise<PaginatedResponseDto<TermResponseDto>> {
    const limit = searchTermDto.limit || 20;
    const results = await this.termsRepository.search(
      searchTermDto.term,
      limit,
      searchTermDto.cursor,
    );

    const items = results.map((term) => new TermResponseDto(term));
    const nextCursor =
      items.length > 0 ? items[items.length - 1].createdAt.toISOString() : undefined;

    return new PaginatedResponseDto<TermResponseDto>(
      items,
      searchTermDto.page || 1,
      limit,
      nextCursor,
    );
  }
}
