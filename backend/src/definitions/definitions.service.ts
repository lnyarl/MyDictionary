import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { FeedService } from "../feed/feed.service";
import { WordsRepository } from "../words/words.repository";
import { DefinitionsRepository } from "./definitions.repository";
import { CreateDefinitionDto } from "./dto/create-definition.dto";
import { Definition } from "./entities/definition.entity";

@Injectable()
export class DefinitionsService {
  constructor(
    private readonly definitionRepository: DefinitionsRepository,
    private readonly wordRepository: WordsRepository,
    private readonly feedService: FeedService,
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

    await this.feedService.invalidateFollowerFeeds(userId);
    await this.feedService.invalidateRecommendations();

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
    const rows = Array.isArray(results) ? results : results.rows;

    return rows.map((row: any) => {
      const definition: Definition & { likesCount: number } = {
        id: row.id,
        content: row.content,
        wordId: row.word_id,
        userId: row.user_id,
        likesCount: row.likes_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
      return definition;
    });
  }

  async findOne(id: string, userId?: string): Promise<Definition> {
    const definition = await this.definitionRepository.findByIdWithPublic(id);

    if (!definition) {
      throw new NotFoundException("Definition not found");
    }

    // Check access based on word's isPublic
    if (!definition.isPublic) {
      if (!userId || (definition.wordUserId !== userId && definition.userId !== userId)) {
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

    await this.feedService.invalidateFollowerFeeds(userId);
    await this.feedService.invalidateRecommendations();
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
