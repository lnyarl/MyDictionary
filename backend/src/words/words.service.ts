import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";

import { PaginatedResponseDto, PaginationDto } from "@shared";
import { DefinitionsService } from "../definitions/definitions.service";
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
    private readonly definitionsService: DefinitionsService,
  ) {}

  async create(userId: string, createWordDto: CreateWordDto): Promise<Word> {
    let wordId: string;
    const existWord = await this.wordRepository.findByTerm(userId, createWordDto.term);
    await this.wordRepository.transaction(async (knex) => {
      if (!existWord) {
        const result = await this.wordRepository
          .create({
            term: createWordDto.term,
            userId,
          })
          .transacting(knex);
        wordId = result[0].id;
      } else {
        wordId = existWord.id;
      }
      await this.definitionsService.create(
        userId,
        {
          ...createWordDto.definition,
          wordId,
        },
        [],
        knex,
      );
    });

    return await this.wordRepository.findById(wordId);
  }

  async findAllByUser(userId: string): Promise<Word[]> {
    return this.wordRepository.findByUserId(userId);
  }

  async findOne(id: string, userId?: string): Promise<Word> {
    const word = await this.wordRepository.findById(id);

    if (!word) {
      throw new NotFoundException("Word not found");
    }

    const hasPublicDefs = await this.wordRepository.hasPublicDefinitions(id);
    if (!hasPublicDefs && (!userId || word.userId !== userId)) {
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

  async autocomplete(
    term: string,
    userId?: string,
  ): Promise<{ myWords: Word[]; othersWords: Word[] }> {
    const normalizedTerm = normalizeSearchTerm(term);
    if (!normalizedTerm) {
      return { myWords: [], othersWords: [] };
    }

    if (!userId) {
      const othersWords = await this.wordRepository.findOthersWordsForAutocomplete(
        normalizedTerm,
        undefined,
        10,
      );
      return { myWords: [], othersWords };
    }

    const myWords = await this.wordRepository.findMyWordsForAutocomplete(normalizedTerm, userId, 3);
    const othersWords = await this.wordRepository.findOthersWordsForAutocomplete(
      normalizedTerm,
      userId,
      7,
    );

    return { myWords, othersWords };
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
