import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  Definition,
  PaginatedResponseDto,
  SearchTermDto,
  TermResponseDto,
  User,
} from "@stashy/shared";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { LikesService } from "../likes/likes.service";
import { TermsService } from "./terms.service";

@Controller()
export class TermsController {
  constructor(
    private readonly termsService: TermsService,
    private readonly likeService: LikesService,
  ) {}

  @Public()
  @UseGuards(JwtAuthGuard)
  @Get("/terms/search")
  async search(
    @Query() searchTermDto: SearchTermDto,
    @CurrentUser() user?: User,
  ): Promise<PaginatedResponseDto<TermResponseDto>> {
    const result = await this.termsService.search(searchTermDto);

    if (result.data.length > 0) {
      const likes = await this.likeService.getLikeInfoByDefinitions(
        result.data.map((d: Definition) => d.id),
        user?.id,
      );

      for (const def of result.data) {
        const likeInfo = likes[def.id];
        if (likeInfo) {
          def.isLiked = likeInfo.isLiked;
          def.likesCount = likeInfo.likesCount;
        }
      }
    }

    return result;
  }
}
