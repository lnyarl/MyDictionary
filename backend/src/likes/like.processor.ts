import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { LikesService } from "./likes.service";

@Processor("likes")
@Injectable()
export class LikeProcessor extends WorkerHost {
  private readonly logger = new Logger(LikeProcessor.name);
  constructor(private readonly likesService: LikesService) {
    super();
  }

  async process(job: Job) {
    try {
      const { userId, definitionId } = job.data;
      if (job.name === "toggle") {
        return this.likesService.executeToggle(userId, definitionId);
      }
      throw new Error(`Unknown job name: ${job.name}`);
    } catch (e) {
      if (e.message) {
        this.logger.error(e.message, e instanceof Error ? e.stack : undefined);
      } else {
        this.logger.error("error", e instanceof Error ? e.stack : undefined);
      }
    }
  }
}
