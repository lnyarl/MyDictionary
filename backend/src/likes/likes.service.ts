import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { DefinitionsRepository } from "../definitions/definitions.repository";
import { Like } from "./entities/like.entity";
import { LikesRepository } from "./likes.repository";

@Injectable()
export class LikesService {
  constructor(
    private readonly likeRepository: LikesRepository,
    private readonly definitionRepository: DefinitionsRepository,
  ) {}

  async toggle(userId: string, definitionId: string): Promise<boolean> {
    const definition = await this.definitionRepository.findById(definitionId);
    if (!definition) {
      throw new NotFoundException("Definition not found");
    }

    // Cannot like your own definition
    if (definition.userId === userId) {
      throw new ForbiddenException("You cannot like your own definition");
    }

    // Check if like already exists
    const existingLike = await this.likeRepository.findByUserIdAndDefinitionId(
      userId,
      definitionId,
    );

    if (existingLike) {
      await this.likeRepository.delete(existingLike.id);
      await this.definitionRepository.decrement(definitionId);
      return false;
    } else {
      await this.likeRepository.create({ userId, definitionId });
      await this.definitionRepository.increment(definitionId);
      return true;
    }
  }

  async checkUserLike(userId: string, definitionId: string): Promise<boolean> {
    const like = await this.likeRepository.findByUserIdAndDefinitionId(userId, definitionId);
    return !!like;
  }

  async getLikesByDefinition(definitionId: string): Promise<Like[]> {
    return this.likeRepository.findByDefinitionId(definitionId);
  }
}
