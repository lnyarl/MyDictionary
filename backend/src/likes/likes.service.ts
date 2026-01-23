import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DefinitionsRepository } from "../definitions/definitions.repository";
import { NotificationType } from "../notifications/entities/notification.entity";
import { NotificationsService } from "../notifications/notifications.service";
import { UsersRepository } from "../users/users.repository";
import { WordsRepository } from "../words/words.repository";
import { Like } from "./entities/like.entity";
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
      return false;
    }

    await this.likeRepository.create({ userId, definitionId });

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

    return true;
  }

  async checkUserLike(userId: string, definitionId: string): Promise<boolean> {
    const like = await this.likeRepository.findByUserIdAndDefinitionId(userId, definitionId);
    return !!like;
  }

  async getLikesByDefinition(definitionId: string): Promise<Like[]> {
    return this.likeRepository.findByDefinitionId(definitionId);
  }
}
