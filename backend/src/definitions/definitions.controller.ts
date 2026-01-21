import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { OptionalAuthGuard } from "../common/guards/optional-auth.guard";
import { IStorageService, STORAGE_SERVICE } from "../common/services/storage/storage.interface";
import type { User } from "../users/entities/user.entity";
import { DefinitionsService } from "./definitions.service";
import { CreateDefinitionDto } from "./dto/create-definition.dto";

@Controller()
export class DefinitionsController {
  constructor(
    private readonly definitionsService: DefinitionsService,
    @Inject(STORAGE_SERVICE) private readonly storageService: IStorageService,
  ) {}

  @Post("/definitions")
  @UseInterceptors(FilesInterceptor("files"))
  async create(
    @CurrentUser() user: User,
    @Body() createDefinitionDto: CreateDefinitionDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const mediaUrls: string[] = [];
    if (files && files.length > 0) {
      const uploadedUrls = await Promise.all(
        files.map((file) => this.storageService.uploadFile(file, "definitions")),
      );
      mediaUrls.push(...uploadedUrls);
    }

    return this.definitionsService.create(user.id, createDefinitionDto, mediaUrls);
  }

  @Get("/definitions/:id")
  findOne(@Param("id") id: string, @CurrentUser() user?: User) {
    return this.definitionsService.findOne(id, user?.id);
  }

  @Get("/definitions/history/:wordId/:userId")
  @UseGuards(OptionalAuthGuard)
  getHistory(
    @Param("wordId") wordId: string,
    @Param("userId") userId: string,
    @CurrentUser() user?: User,
  ) {
    return this.definitionsService.getHistory(wordId, userId, user?.id);
  }

  @Delete("/definitions/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string, @CurrentUser() user: User) {
    await this.definitionsService.remove(id, user.id);
  }
}
