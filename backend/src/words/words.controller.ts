import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from "@nestjs/common";
import { Public } from "src/common/decorators/public.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { OptionalAuthGuard } from "../common/guards/optional-auth.guard";
import { DefinitionsService } from "../definitions/definitions.service";
import { User } from "../users/entities/user.entity";
import { CreateWordDto } from "./dto/create-word.dto";
import { SearchWordDto } from "./dto/search-word.dto";
import { UpdateWordDto } from "./dto/update-word.dto";
import { WordsService } from "./words.service";

@Controller("words")
export class WordsController {
	constructor(
		private readonly wordsService: WordsService,
		private readonly definitionsService: DefinitionsService,
	) { }

	@Post()
	create(@CurrentUser() user: User, @Body() createWordDto: CreateWordDto) {
		return this.wordsService.create(user.id, createWordDto);
	}

	@Get()
	findAll(@CurrentUser() user: User) {
		return this.wordsService.findAllByUser(user.id);
	}

	@Get("search")
	@Public()
	search(@Query() searchParam: SearchWordDto) {
		const { term } = searchParam;
		return this.wordsService.search(term, searchParam);
	}

	@Get(":id")
	@UseGuards(OptionalAuthGuard)
	findOne(@Param("id") id: string, @CurrentUser() user?: User) {
		return this.wordsService.findOne(id, user?.id);
	}

	@Get(":wordId/definitions")
	@UseGuards(OptionalAuthGuard)
	findDefinitions(@Param("wordId") wordId: string, @CurrentUser() user?: User) {
		return this.definitionsService.findAllByWord(wordId, user?.id);
	}

	@Patch(":id")
	update(@Param("id") id: string, @CurrentUser() user: User, @Body() updateWordDto: UpdateWordDto) {
		return this.wordsService.update(id, user.id, updateWordDto);
	}

	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	async remove(@Param("id") id: string, @CurrentUser() user: User) {
		await this.wordsService.remove(id, user.id);
	}
}
