import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { OptionalAuthGuard } from "../common/guards/optional-auth.guard";
import { DefinitionsService } from "../definitions/definitions.service";
import { User } from "../users/entities/user.entity";
import { CreateWordDto } from "./dto/create-word.dto";
import { SearchWordDto } from "./dto/search-word.dto";
import { UpdateWordDto } from "./dto/update-word.dto";
import { WordsService } from "./words.service";

@Controller()
export class WordsController {
  constructor(
    private readonly wordsService: WordsService,
    private readonly definitionsService: DefinitionsService,
  ) {}

  @Post("/words")
  create(@CurrentUser() user: User, @Body() createWordDto: CreateWordDto) {
    return this.wordsService.create(user.id, createWordDto);
  }

  @Get("/words")
  findAll(@CurrentUser() user: User) {
    return this.wordsService.findAllByUser(user.id);
  }

  @Get("/words/autocomplete")
  @Public()
  @UseGuards(OptionalAuthGuard)
  autocomplete(@Query("term") term: string, @CurrentUser() user?: User) {
    return this.wordsService.autocomplete(term, user?.id);
  }

  @Get("/words/search")
  @Public()
  @UseGuards(OptionalAuthGuard)
  search(@Query() searchParam: SearchWordDto, @CurrentUser() user?: User) {
    const { term } = searchParam;
    return this.wordsService.search(term, searchParam, user?.id);
  }

  @Get("/words/:id")
  @UseGuards(OptionalAuthGuard)
  async findOne(@Param("id") id: string, @CurrentUser() user?: User) {
    const word = await this.wordsService.findOne(id);
    if (!word) {
      throw new NotFoundException("Word not found");
    }
    if (user && word.userId !== user.id) {
      throw new ForbiddenException("You do not have access to this word");
    }

    return word;
  }

  @Get("/words/:wordId/definitions")
  @Public()
  @UseGuards(OptionalAuthGuard)
  async findDefinitions(@Param("wordId") wordId: string, @CurrentUser() user?: User) {
    const word = await this.wordsService.findOne(wordId);
    if (!word) {
      throw new NotFoundException("Word not found");
    }
    if (user && word.userId !== user.id) {
      throw new ForbiddenException("You do not have access to this word");
    }
    return await this.definitionsService.findAllByWord(word, user?.id);
  }

  @Patch("/words/:id")
  update(@Param("id") id: string, @CurrentUser() user: User, @Body() updateWordDto: UpdateWordDto) {
    return this.wordsService.update(id, updateWordDto);
  }

  @Delete("/words/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string, @CurrentUser() user: User) {
    await this.wordsService.remove(id, user.id);
  }
}
