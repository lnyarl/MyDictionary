import { BullModule } from "@nestjs/bullmq";
import { Global, Module } from "@nestjs/common";
import { BadgesModule } from "../../badges/badges.module";
import { redisProvider } from "../cache/redis.provider";
import { EventEmitterService } from "./event-emitter.service";
import { EventsProcessor } from "./events.processor";
import { EventsRepository } from "./events.repository";
import { BadgeProgressHandler } from "./handlers/badge-progress.handler";
import { EVENT_HANDLERS } from "./handlers/event-handler.interface";
import { EventStorageHandler } from "./handlers/event-storage.handler";
import { PageViewAggregateHandler } from "./handlers/page-view-aggregate.handler";

const handlers = [EventStorageHandler, PageViewAggregateHandler, BadgeProgressHandler];

@Global()
@Module({
  imports: [
    BadgesModule,
    BullModule.registerQueue({
      name: "events",
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      },
    }),
  ],
  providers: [
    redisProvider,
    {
      provide: EVENT_HANDLERS,
      useFactory: (...handlerInstances: InstanceType<(typeof handlers)[number]>[]) => {
        return handlerInstances;
      },
      inject: handlers,
    },
    EventEmitterService,
    EventsProcessor,
    EventsRepository,
    ...handlers,
  ],
  exports: [EventEmitterService, EventsRepository, BullModule],
})
export class EventsModule {}
