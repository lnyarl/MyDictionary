import { InjectQueue } from "@nestjs/bullmq";
import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Queue } from "bullmq";
import { EventEmitterService } from "../common/events/event-emitter.service";
import { DefinitionsRepository } from "../definitions/definitions.repository";
import { NotificationType } from "../notifications/entities/notification.entity";
import { NotificationsService } from "../notifications/notifications.service";
import { UsersRepository } from "../users/users.repository";
import { WordsRepository } from "../words/words.repository";
import type { Like } from "./entities/like.entity";
import { LikesRepository } from "./likes.repository";

@Injectable()
export class LikesService {
  constructor(
    private readonly likeRepository: LikesRepository,
    private readonly definitionRepository: DefinitionsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly wordsRepository: WordsRepository,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
    @InjectQueue("likes") private readonly likesQueue: Queue,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  async toggle(userId: string, definitionId: string) {
    await this.likesQueue.add("toggle", {
      userId,
      definitionId,
    });
  }

  async executeToggle(userId: string, definitionId: string): Promise<boolean> {
    const definition = await this.definitionRepository.findById(definitionId);
    if (!definition) {
      throw new NotFoundException("Definition not found");
    }

    const existingLike = await this.likeRepository.findByUserIdAndDefinitionIdWithDeleted(
      userId,
      definitionId,
    );

    let result = false;
    if (existingLike && !existingLike.deletedAt) {
      await this.likeRepository.delete(existingLike.id);
      result = false;
      await this.eventEmitter.emitUnlike(userId, definitionId, definition.userId);
    } else if (existingLike?.deletedAt) {
      await this.likeRepository.restore(existingLike.id);
      result = true;
      await this.eventEmitter.emitLike(userId, definitionId, definition.userId);
    } else {
      await this.likeRepository.create({ userId, definitionId });
      result = true;
      await this.eventEmitter.emitLike(userId, definitionId, definition.userId);
    }

    if (definition.userId !== userId) {
      const liker = await this.usersRepository.findById(userId);
      const word = await this.wordsRepository.findById(definition.wordId);
      if (liker && word) {
        await this.notificationsService.createNotification({
          userId: definition.userId,
          type: NotificationType.LIKE,
          title: `${liker.nickname}님이 "${word.term}"에 대한 정의를 좋아합니다`,
          actorId: userId,
          targetUrl: `/search?q=${encodeURIComponent(word.term)}`,
        });
      }
    }

    return result;
  }

  async checkUserLike(userId: string, definitionId: string): Promise<boolean> {
    const like = await this.likeRepository.findByUserIdAndDefinitionIdWithDeleted(
      userId,
      definitionId,
    );
    return !!(like && !like.deletedAt);
  }

  async getLikesByDefinition(definitionId: string): Promise<Like[]> {
    return this.likeRepository.findByDefinitionId(definitionId);
  }

  async getLikeInfoByDefinitions(definitionIds: string[], userId?: string) {
    const result = await this.likeRepository.findLikeInfoByDefinitionIds(definitionIds, userId);
    const likes: { [definitionId: string]: { isLiked: boolean; likeCount: number } } =
      result.reduce((prev, current) => {
        return {
          ...prev,
          [current.definitionId]: { isLiked: current.isLiked, likeCount: current.likeCount },
        };
      }, {});
    return likes;
  }
}
