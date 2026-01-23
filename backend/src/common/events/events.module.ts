import { Global, Module } from "@nestjs/common";
import { BadgesModule } from "../../badges/badges.module";
import { EventEmitterService } from "./event-emitter.service";
import { EventWorkerService } from "./event-worker.service";
import { EventsRepository } from "./events.repository";
import { BadgeProgressHandler } from "./handlers/badge-progress.handler";
import { EVENT_HANDLERS } from "./handlers/event-handler.interface";
import { EventStorageHandler } from "./handlers/event-storage.handler";
import { PageViewAggregateHandler } from "./handlers/page-view-aggregate.handler";
import { PUBSUB_PROVIDER } from "./pubsub/pubsub.interface";
import { RedisPubSubProvider } from "./pubsub/redis-pubsub.provider";
import { redisProvider } from "../cache/redis.provider";

const handlers = [EventStorageHandler, PageViewAggregateHandler, BadgeProgressHandler];

@Global()
@Module({
  imports: [BadgesModule],
  providers: [
    redisProvider,
    {
      provide: PUBSUB_PROVIDER,
      useClass: RedisPubSubProvider,
    },
    {
      provide: EVENT_HANDLERS,
      useFactory: (...handlerInstances: InstanceType<(typeof handlers)[number]>[]) => {
        return handlerInstances;
      },
      inject: handlers,
    },
    EventEmitterService,
    EventWorkerService,
    EventsRepository,
    ...handlers,
  ],
  exports: [EventEmitterService, EventsRepository],
})
export class EventsModule {}
