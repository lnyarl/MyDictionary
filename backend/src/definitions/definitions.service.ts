import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { WordsRepository } from "../words/words.repository";
import { DefinitionsRepository } from "./definitions.repository";
import { CreateDefinitionDto } from "./dto/create-definition.dto";
import { Definition } from "./entities/definition.entity";

@Injectable()
export class DefinitionsService {
  constructor(
    private readonly definitionRepository: DefinitionsRepository,
    private readonly wordRepository: WordsRepository,
  ) {}

  async create(userId: string, createDefinitionDto: CreateDefinitionDto): Promise<Definition> {
    // Verify word exists
    const word = await this.wordRepository.findById(createDefinitionDto.wordId);

    if (!word) {
      throw new NotFoundException("Word not found");
    }

    // Check access: only owner can add definitions to private words
    if (!word.isPublic && word.userId !== userId) {
      throw new ForbiddenException("You do not have access to this word");
    }

    const definition = await this.definitionRepository.create({
      ...createDefinitionDto,
      userId,
    });

    return definition;
  }

  async findAllByWord(wordId: string, userId?: string): Promise<Definition[]> {
    // Check if word exists and verify access
    const word = await this.wordRepository.findById(wordId);

    if (!word) {
      throw new NotFoundException("Word not found");
    }

    // Check access based on word's isPublic
    if (!word.isPublic && (!userId || word.userId !== userId)) {
      throw new ForbiddenException("You do not have access to this word");
    }

    // Get latest definition per user using raw query with window function
    const results = await this.definitionRepository.findByWordIdForEachUser(wordId);

    return results.map((row: any) => {
      const definition = new Definition();
      definition.id = row.id;
      definition.content = row.content;
      definition.wordId = row.word_id;
      definition.userId = row.user_id;
      definition.likesCount = row.likes_count;
      definition.createdAt = row.created_at;
      definition.updatedAt = row.updated_at;
      definition.user = {
        id: row.user_id,
        nickname: row.user_nickname,
      } as any;
      return definition;
    });
  }

  async findOne(id: string, userId?: string): Promise<Definition> {
    const definition = await this.definitionRepository.findByIdWithPublic(id);

    if (!definition) {
      throw new NotFoundException("Definition not found");
    }

    // Check access based on word's isPublic
    if (!definition.is_public) {
      if (!userId || (definition.word_user_id !== userId && definition.user_id !== userId)) {
        throw new ForbiddenException("You do not have access to this definition");
      }
    }

    return definition;
  }

  async remove(id: string, userId: string): Promise<void> {
    const definition = await this.definitionRepository.findById(id);

    if (!definition) {
      throw new NotFoundException("Definition not found");
    }

    if (definition.userId !== userId) {
      throw new ForbiddenException("You do not have permission to delete this definition");
    }

    await this.definitionRepository.delete(id);
  }

  async getHistory(
    wordId: string,
    targetUserId: string,
    requestUserId?: string,
  ): Promise<Definition[]> {
    // Check word access
    const word = await this.wordRepository.findById(wordId);

    if (!word) {
      throw new NotFoundException("Word not found");
    }

    // Check if requester has access to the word
    if (!word.isPublic && (!requestUserId || word.userId !== requestUserId)) {
      throw new ForbiddenException("You do not have access to this word");
    }

    const definitions = await this.definitionRepository.findByWordIdAndUserId(wordId, targetUserId);
    return definitions;
  }
}
