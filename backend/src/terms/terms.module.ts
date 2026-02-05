import { Module } from "@nestjs/common";
import { CommonModule } from "../common/common.module";
import { LikesModule } from "../likes/likes.module";
import { TermsController } from "./terms.controller";
import { TermsRepository } from "./terms.repository";
import { TermsService } from "./terms.service";

@Module({
  imports: [CommonModule, LikesModule],
  controllers: [TermsController],
  providers: [TermsService, TermsRepository],
  exports: [TermsService],
})
export class TermsModule {}
