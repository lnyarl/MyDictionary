import { Inject, Injectable } from "@nestjs/common";
import { generateId } from "@shared";
import type { EventPayload } from "./event.types";
import { EventChannel, EventType } from "./event.types";
import type { PubSubMessage, PubSubProvider } from "./pubsub/pubsub.interface";
import { PUBSUB_PROVIDER } from "./pubsub/pubsub.interface";

@Injectable()
export class EventEmitterService {
  constructor(@Inject(PUBSUB_PROVIDER) private readonly pubsub: PubSubProvider) {}

  async emit<T extends EventPayload>(
    type: EventType,
    payload: T,
    channel: EventChannel = EventChannel.USER_ACTIVITY,
  ): Promise<void> {
    const message: PubSubMessage<T> = {
      id: generateId(),
      type,
      payload,
      timestamp: new Date(),
    };

    await this.pubsub.publish(channel, message);
  }

  async emitPageView(
    userId: string,
    path: string,
    options?: { referrer?: string; sessionId?: string; userAgent?: string; ipAddress?: string },
  ): Promise<void> {
    await this.emit(EventType.PAGE_VIEW, {
      userId,
      path,
      ...options,
    });
  }

  async emitWordCreate(userId: string, wordId: string, term: string): Promise<void> {
    await this.emit(EventType.WORD_CREATE, { userId, wordId, term });
  }

  async emitWordUpdate(userId: string, wordId: string, term?: string): Promise<void> {
    await this.emit(EventType.WORD_UPDATE, { userId, wordId, term });
  }

  async emitWordDelete(userId: string, wordId: string): Promise<void> {
    await this.emit(EventType.WORD_DELETE, { userId, wordId });
  }

  async emitDefinitionCreate(userId: string, definitionId: string, wordId: string): Promise<void> {
    await this.emit(EventType.DEFINITION_CREATE, { userId, definitionId, wordId });
  }

  async emitDefinitionUpdate(userId: string, definitionId: string, wordId: string): Promise<void> {
    await this.emit(EventType.DEFINITION_UPDATE, { userId, definitionId, wordId });
  }

  async emitDefinitionDelete(userId: string, definitionId: string, wordId: string): Promise<void> {
    await this.emit(EventType.DEFINITION_DELETE, { userId, definitionId, wordId });
  }

  async emitFollow(userId: string, targetUserId: string): Promise<void> {
    await this.emit(EventType.USER_FOLLOW, { userId, targetUserId });
  }

  async emitUnfollow(userId: string, targetUserId: string): Promise<void> {
    await this.emit(EventType.USER_UNFOLLOW, { userId, targetUserId });
  }

  async emitLike(userId: string, definitionId: string, definitionOwnerId: string): Promise<void> {
    await this.emit(EventType.DEFINITION_LIKE, { userId, definitionId, definitionOwnerId });
  }

  async emitUnlike(userId: string, definitionId: string, definitionOwnerId: string): Promise<void> {
    await this.emit(EventType.DEFINITION_UNLIKE, { userId, definitionId, definitionOwnerId });
  }

  async emitSearch(userId: string, query: string, resultsCount: number): Promise<void> {
    await this.emit(EventType.SEARCH, { userId, query, resultsCount });
  }
}
