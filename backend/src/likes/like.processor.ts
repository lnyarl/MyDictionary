import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Job } from "bullmq";
import { LikesService } from "./likes.service";

@Processor("likes")
@Injectable()
export class LikeProcessor extends WorkerHost {
  constructor(private readonly likesService: LikesService) {
    super();
  }

  async process(job: Job) {
    const { userId, definitionId } = job.data;
    if (job.name === "toggle") {
      return this.likesService.executeToggle(userId, definitionId);
    }
    throw new Error(`Unknown job name: ${job.name}`);
  }
}
