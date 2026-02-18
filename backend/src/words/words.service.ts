import { Injectable, NotFoundException } from "@nestjs/common";
import { PaginatedResponseDto, PaginationDto } from "@stashy/shared";
import { CreateWordDto } from "@stashy/shared/dto/word/create-word.dto";
import { EventEmitterService } from "../common/events/event-emitter.service";
import { Word } from "./entities/word.entity";
import { normalizeSearchTerm } from "./logic/word-search.logic";
import { WordsRepository } from "./words.repository";

@Injectable()
export class WordsService {
  constructor(
    private readonly wordRepository: WordsRepository,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  async create(userId: string, createWordDto: CreateWordDto): Promise<Word> {
    let word: { id: string; term: string };
    const existWord = await this.wordRepository.findByTerm(userId, createWordDto.term);
    if (!existWord) {
      const result = await this.wordRepository.create({
        term: createWordDto.term,
        userId,
      });
      word = result[0];
      await this.eventEmitter.emitWordCreate(userId, word.id, word.term);
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
        10,
      );
      const mappedOthersWords = othersWords.map((i) => ({
        id: i.id,
        term: i.text,
      }));
      return { myWords: [], othersWords: mappedOthersWords };
    }

    const myWords = await this.wordRepository.findMyWordsForAutocomplete(normalizedTerm, userId, 3);
    const othersWords = await this.wordRepository.findOthersWordsForAutocomplete(
      normalizedTerm,
      10,
    );
    const myTerms = myWords.map((i) => i.term);
    const filteredOthersWords = othersWords
      .filter((i) => !myTerms.includes(i.text))
      .map((i) => ({
        id: i.id,
        term: i.text,
      }));

    return { myWords, othersWords: filteredOthersWords };
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
    const nextCursor = words.length > 0 ? String(words[words.length - 1].createdAt) : undefined;

    return new PaginatedResponseDto<Word>(
      words,
      paginationDto.page || 1,
      paginationDto.limit || 20,
      nextCursor,
    );
  }
}
