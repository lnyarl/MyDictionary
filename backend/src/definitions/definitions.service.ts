import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PaginatedResponseDto, PaginationDto } from "@stashy/shared";
import { CreateDefinitionDto } from "@stashy/shared/dto/definition/create-definition.dto";
import { UpdateDefinitionDto } from "@stashy/shared/dto/definition/update-definition.dto";
import { Knex } from "knex";
import { MetadataService } from "../common/services/metadata.service";
import { DefinitionHistoriesRepository } from "../definition-histories/definition-histories.repository";
import type { DefinitionHistory } from "../definition-histories/entities/definition-history.entity";
import { FeedService } from "../feed/feed.service";
import { Word } from "../words/entities/word.entity";
import { WordsRepository } from "../words/words.repository";
import { DefinitionsRepository } from "./definitions.repository";
import { Definition } from "./entities/definition.entity";

@Injectable()
export class DefinitionsService {
  constructor(
    private readonly definitionRepository: DefinitionsRepository,
    private readonly definitionHistoriesRepository: DefinitionHistoriesRepository,
    @Inject(forwardRef(() => FeedService))
    private readonly feedService: FeedService,
    private readonly metadataService: MetadataService,
    private readonly wordRepository: WordsRepository,
  ) {}

  async create(
    userId: string,
    word: Word,
    createDefinitionDto: CreateDefinitionDto,
    mediaUrls: string[] = [],
    transaction?: Knex.Transaction,
  ): Promise<Definition> {
    if (word.userId !== userId) {
      throw new ForbiddenException("You do not have access to this word");
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urlsInContent = createDefinitionDto.content.match(urlRegex) || [];
    const metadataPromises = urlsInContent.map((url) => this.metadataService.extractMetadata(url));
    const metadataList = await Promise.all(metadataPromises);

    const combinedMedia = [...mediaUrls.map((url) => ({ url, type: "image" })), ...metadataList];

    const definition = await this.definitionRepository
      .create({
        ...createDefinitionDto,
        userId,
        isPublic: createDefinitionDto.isPublic,
        tags: createDefinitionDto.tags || [],
        mediaUrls: combinedMedia,
      })
      .maybeTransacting(transaction);
    await this.feedService.invalidateFollowerFeeds(userId);
    await this.feedService.invalidateRecommendations();

    return definition[0];
  }

  async findWordById(id: string): Promise<Word> {
    const word = await this.wordRepository.findById(id);

    if (!word) {
      throw new NotFoundException("Word not found");
    }

    return word;
  }

  async findAllByWord(word: Word, userId?: string): Promise<Definition[]> {
    if (userId && word.userId !== userId) {
      throw new ForbiddenException("You do not have access to this word");
    }

    const results = await this.definitionRepository.findAllByWordId(word.id);
    const rows = Array.isArray(results) ? results : results.rows;

    return rows.map((row: any) => ({
      id: row.id,
      content: row.content,
      wordId: row.wordid,
      userId: row.userid,
      tags: row.tags || [],
      mediaUrls: row.mediaUrls || [],
      likesCount: Number(row.likesCount) || 0,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      nickname: row.nickname,
      profilePicture: row.profilePicture,
    }));
  }

  async findOne(id: string, userId?: string): Promise<Definition> {
    const definition = await this.definitionRepository.findByIdWithPublic(id);

    if (!definition) {
      throw new NotFoundException("Definition not found");
    }

    if (!definition.isPublic) {
      if (!userId || (definition.wordUserId !== userId && definition.userId !== userId)) {
        throw new ForbiddenException("You do not have access to this definition");
      }
    }

    return definition;
  }

  async update(
    id: string,
    userId: string,
    updateDefinitionDto: UpdateDefinitionDto,
    mediaUrls: string[] = [],
  ): Promise<Definition> {
    const definition = await this.definitionRepository.findById(id);

    if (!definition) {
      throw new NotFoundException("Definition not found");
    }

    if (definition.userId !== userId) {
      throw new ForbiddenException("You do not have permission to update this definition");
    }

    await this.definitionHistoriesRepository.create({
      definitionId: id,
      content: definition.content,
      tags: definition.tags || [],
      mediaUrls: definition.mediaUrls || [],
    });

    let combinedMedia = definition.mediaUrls || [];
    if (updateDefinitionDto.content) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urlsInContent = updateDefinitionDto.content.match(urlRegex) || [];
      const metadataPromises = urlsInContent.map((url) =>
        this.metadataService.extractMetadata(url),
      );
      const metadataList = await Promise.all(metadataPromises);
      combinedMedia = [...mediaUrls.map((url) => ({ url, type: "image" })), ...metadataList];
    }

    const updated = await this.definitionRepository.updateDefinition(id, {
      content: updateDefinitionDto.content,
      tags: updateDefinitionDto.tags,
      isPublic: updateDefinitionDto.isPublic,
      mediaUrls: combinedMedia,
    });

    await this.feedService.invalidateFollowerFeeds(userId);
    await this.feedService.invalidateRecommendations();

    return updated[0];
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

  async getDefinitionHistory(
    definitionId: string,
    requestUserId?: string,
  ): Promise<DefinitionHistory[]> {
    const definition = await this.definitionRepository.findByIdWithPublic(definitionId);

    if (!definition) {
      throw new NotFoundException("Definition not found");
    }

    if (!definition.isPublic) {
      if (
        !requestUserId ||
        (definition.wordUserId !== requestUserId && definition.userId !== requestUserId)
      ) {
        throw new ForbiddenException("You do not have access to this definition");
      }
    }

    return this.definitionHistoriesRepository.findByDefinitionId(definitionId);
  }

  async getDefinitionsByTerm(term: string, user?: any): Promise<Definition[]> {
    return this.definitionRepository.findByTerm(term, user?.id);
  }

  async getUserPublicDefinitions(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Definition>> {
    const listQuery = this.definitionRepository.findByUserId(
      userId,
      paginationDto.limit || 20,
      paginationDto.cursor,
    );
    const definitions = await listQuery;
    const nextCursor =
      definitions.length > 0 ? (definitions[definitions.length - 1].createdAt as any) : undefined;

    return new PaginatedResponseDto<Definition>(
      definitions,
      paginationDto.page || 1,
      paginationDto.limit || 20,
      nextCursor,
    );
  }
}
