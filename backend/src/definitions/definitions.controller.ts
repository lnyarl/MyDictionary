import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { PaginationDto } from "@stashy/shared";
import { CreateDefinitionDto } from "@stashy/shared/dto/definition/create-definition.dto";
import { GetByUserIdDto } from "@stashy/shared/dto/definition/select-definition.dto";
import { UpdateDefinitionDto } from "@stashy/shared/dto/definition/update-definition.dto";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { OptionalAuthGuard } from "../common/guards/optional-auth.guard";
import { IStorageService, STORAGE_SERVICE } from "../common/services/storage/storage.interface";
import type { User } from "../users/entities/user.entity";
import { DefinitionsService } from "./definitions.service";

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

    const word = await this.definitionsService.findWordById(createDefinitionDto.wordId);
    return this.definitionsService.create(user.id, word, createDefinitionDto, mediaUrls);
  }

  @Get("/definitions/term/:term")
  @UseGuards(OptionalAuthGuard)
  getDefinitionsByTerm(@Param("term") term: string, @CurrentUser() user?: User) {
    return this.definitionsService.getDefinitionsByTerm(term, user);
  }

  @Get("/definitions/:id")
  findOne(@Param("id") id: string, @CurrentUser() user?: User) {
    return this.definitionsService.findOne(id, user?.id);
  }

  @Get("/definitions/:id/history")
  @UseGuards(OptionalAuthGuard)
  getDefinitionHistory(@Param("id") id: string, @CurrentUser() user?: User) {
    return this.definitionsService.getDefinitionHistory(id, user?.id);
  }

  @Patch("/definitions/:id")
  @UseInterceptors(FilesInterceptor("files"))
  async update(
    @Param("id") id: string,
    @CurrentUser() user: User,
    @Body() updateDefinitionDto: UpdateDefinitionDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const mediaUrls: string[] = [];
    if (files && files.length > 0) {
      const uploadedUrls = await Promise.all(
        files.map((file) => this.storageService.uploadFile(file, "definitions")),
      );
      mediaUrls.push(...uploadedUrls);
    }

    return this.definitionsService.update(id, user.id, updateDefinitionDto, mediaUrls);
  }

  @Delete("/definitions/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string, @CurrentUser() user: User) {
    await this.definitionsService.remove(id, user.id);
  }

  @Get("/definitions")
  @Public()
  async getUserDefinitions(@Query() query: GetByUserIdDto) {
    const { userId, ...paginationDto } = query;
    return this.definitionsService.getDefinitionsByTerm(userId, paginationDto);
  }
}
