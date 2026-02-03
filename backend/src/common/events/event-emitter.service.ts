import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { EventType } from "@stashy/shared";
import { Queue } from "bullmq";
import type { EventPayload } from "./event.types";

@Injectable()
export class EventEmitterService {
  private readonly logger = new Logger(EventEmitterService.name);

  constructor(@InjectQueue("events") private readonly eventsQueue: Queue) {}

  async emit<T extends EventPayload>(type: EventType, payload: T): Promise<void> {
    try {
      this.logger.debug(`Emitting event ${type} with payload: ${JSON.stringify(payload)}`);
      await this.eventsQueue.add(type, payload);
    } catch (error) {
      this.logger.error(
        `Failed to emit event ${type}:`,
        error instanceof Error ? error.stack : error,
      );
    }
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
