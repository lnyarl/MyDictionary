import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";

import { PaginatedResponseDto, PaginationDto } from "@shared";
import { DefinitionsRepository } from "src/definitions/definitions.repository";
import { Definition } from "../definitions/entities/definition.entity";
import { CreateWordDto } from "./dto/create-word.dto";
import { UpdateWordDto } from "./dto/update-word.dto";
import { Word } from "./entities/word.entity";
import { normalizeSearchTerm } from "./logic/word-search.logic";
import { WordsRepository } from "./words.repository";

@Injectable()
export class WordsService {
  constructor(
    private readonly wordRepository: WordsRepository,
    private readonly definitionRepository: DefinitionsRepository,
  ) {}

  /**
   * Filter definitions to show only latest per user
   */
  private filterLatestDefinitionsPerUser(words: Word[]): Word[] {
    return words.map((word) => {
      if (!word.definitions || word.definitions.length === 0) {
        return word;
      }

      // Group by userId and get latest
      const definitionsByUser = new Map<string, Definition>();

      for (const def of word.definitions) {
        const existing = definitionsByUser.get(def.userId);
        if (!existing || new Date(def.createdAt) > new Date(existing.createdAt)) {
          definitionsByUser.set(def.userId, def);
        }
      }

      return {
        ...word,
        definitions: Array.from(definitionsByUser.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      };
    });
  }

  async create(userId: string, createWordDto: CreateWordDto): Promise<Word> {
    return this.wordRepository.create({
      ...createWordDto,
      userId,
    });
  }

  async findAllByUser(userId: string): Promise<Word[]> {
    return this.wordRepository.findByUserId(userId);
  }

  async findOne(id: string, userId?: string): Promise<Word> {
    const word = await this.wordRepository.findById(id);

    if (!word) {
      throw new NotFoundException("Word not found");
    }

    if (!word.isPublic && (!userId || word.userId !== userId)) {
      throw new ForbiddenException("You do not have access to this word");
    }

    return word;
  }

  async update(id: string, updateWordDto: UpdateWordDto): Promise<Word> {
    const updated = await this.wordRepository.updateAll(id, updateWordDto as any);
    if (!updated) {
      throw new NotFoundException("Word not found");
    }
    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    await this.wordRepository.delete(id);
  }

  async search(
    term: string,
    paginationDto: PaginationDto,
    userId?: string,
  ): Promise<PaginatedResponseDto<Word>> {
    const normalizedTerm = normalizeSearchTerm(term);

    if (!normalizedTerm) {
      return new PaginatedResponseDto<Word>([], 0, paginationDto.page, paginationDto.limit);
    }

    const { listQuery, countQuery } = this.wordRepository.searchWithDefinitions(
      term,
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
}
