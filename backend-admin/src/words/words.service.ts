import { Injectable } from "@nestjs/common";
import { Word } from "./entities/word.entity";
import { WordsRepository } from "./words.repository";

const CANDIDATE_WORDS = Array.from({ length: 100 }, (_, i) => `Word ${i + 1}`);

@Injectable()
export class WordsService {
  constructor(private readonly wordsRepository: WordsRepository) {}

  async getWordsByUserId(userId: string): Promise<Word[]> {
    return this.wordsRepository.findByUserId(userId);
  }

  async createDummyWord(userId: string): Promise<void> {
    const randomWordIndex = Math.floor(Math.random() * CANDIDATE_WORDS.length);
    const term = CANDIDATE_WORDS[randomWordIndex];

    const randomDefIndex = Math.floor(Math.random() * 10) + 1;
    const definitionContent = `Definition ${randomDefIndex} for ${term}`;

    await this.wordsRepository.createWithDefinition({ term, userId }, definitionContent);
  }
}
