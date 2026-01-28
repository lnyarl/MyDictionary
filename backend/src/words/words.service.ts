import { Injectable, NotFoundException } from "@nestjs/common";
import { PaginatedResponseDto, PaginationDto } from "@stashy/shared";
import { CreateWordDto } from "@stashy/shared/dto/word/create-word.dto";
import { Word } from "./entities/word.entity";
import { normalizeSearchTerm } from "./logic/word-search.logic";
import { WordsRepository } from "./words.repository";

@Injectable()
export class WordsService {
  constructor(private readonly wordRepository: WordsRepository) {}

  async create(userId: string, createWordDto: CreateWordDto): Promise<Word> {
    let word: Word;
    const existWord = await this.wordRepository.findByTerm(userId, createWordDto.term);
    if (!existWord) {
      const result = await this.wordRepository.create({
        term: createWordDto.term,
        userId,
      });
      word = result[0];
    } else {
      word = existWord;
    }
    return await this.wordRepository.findById(word.id);
  }

  async findAllByUser(userId: string): Promise<Word[]> {
    return this.wordRepository.findByUserId(userId);
  }

  async findOne(id: string): Promise<Word> {
    const word = await this.wordRepository.findById(id);

    if (!word) {
      throw new NotFoundException("Word not found");
    }

    return word;
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
      return new PaginatedResponseDto<Word>([], paginationDto.page || 1, paginationDto.limit || 20);
    }

    const listQuery = this.wordRepository.searchWithDefinitions(
      term,
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
