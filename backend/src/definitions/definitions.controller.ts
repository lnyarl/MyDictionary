import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { OptionalAuthGuard } from "../common/guards/optional-auth.guard";
import type { User } from "../users/entities/user.entity";
import { DefinitionsService } from "./definitions.service";
import { CreateDefinitionDto } from "./dto/create-definition.dto";

@Controller("definitions")
export class DefinitionsController {
  constructor(private readonly definitionsService: DefinitionsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() createDefinitionDto: CreateDefinitionDto) {
    return this.definitionsService.create(user.id, createDefinitionDto);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user?: User) {
    return this.definitionsService.findOne(id, user?.id);
  }

  @Get("history/:wordId/:userId")
  @UseGuards(OptionalAuthGuard)
  getHistory(
    @Param("wordId") wordId: string,
    @Param("userId") userId: string,
    @CurrentUser() user?: User,
  ) {
    return this.definitionsService.getHistory(wordId, userId, user?.id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string, @CurrentUser() user: User) {
    await this.definitionsService.remove(id, user.id);
  }
}
