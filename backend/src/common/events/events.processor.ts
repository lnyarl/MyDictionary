import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import type { EventMessage, EventPayload, EventType } from "./event.types";
import type { EventHandler } from "./handlers/event-handler.interface";
import { EVENT_HANDLERS } from "./handlers/event-handler.interface";

@Processor("events")
export class EventsProcessor extends WorkerHost {
  private readonly logger = new Logger(EventsProcessor.name);
  private readonly handlerMap: Map<EventType, EventHandler[]> = new Map();

  constructor(@Inject(EVENT_HANDLERS) private readonly handlers: EventHandler[]) {
    super();
    this.buildHandlerMap();
  }

  private buildHandlerMap(): void {
    for (const handler of this.handlers) {
      for (const eventType of handler.supportedEvents) {
        const existing = this.handlerMap.get(eventType) || [];
        existing.push(handler);
        this.handlerMap.set(eventType, existing);
      }
    }
  }

  async process(job: Job<EventPayload>): Promise<void> {
    const eventType = job.name as EventType;
    const payload = job.data;
    const handlers = this.handlerMap.get(eventType) || [];

    if (handlers.length === 0) {
      this.logger.debug(`No handlers found for event: ${eventType}`);
      return;
    }

    const message: EventMessage<EventPayload> = {
      id: job.id || "unknown",
      type: eventType,
      payload: payload,
      timestamp: new Date(job.timestamp),
    };

    this.logger.debug(`Processing event: ${eventType} (Job ID: ${job.id})`);

    await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler.handle(message);
        } catch (error) {
          this.logger.error(
            `Error in handler ${handler.constructor.name} for event ${eventType}:`,
            error instanceof Error ? error.stack : error,
          );
          throw error;
        }
      }),
    );
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job) {
    this.logger.debug(`Event processed successfully: ${job.name} (Job ID: ${job.id})`);
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job, error: Error) {
    this.logger.error(`Event processing failed: ${job.name} (Job ID: ${job.id})`, error.stack);
  }
}
