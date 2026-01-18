import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { PaginationDto } from "../common/dto/pagination.dto";
import { UpdateNicknameDto } from "./dto/update-nickname.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  getMe(@CurrentUser() user: User) {
    return user;
  }

  @Patch("me/nickname")
  async updateNickname(@CurrentUser() user: User, @Body() updateNicknameDto: UpdateNicknameDto) {
    return this.usersService.updateNickname(user.id, updateNicknameDto.nickname);
  }

  @Get(":userId/profile")
  @Public()
  async getUserProfile(@Param("userId") userId: string) {
    return this.usersService.getUserProfile(userId);
  }

  @Get(":userId/words")
  @Public()
  async getUserWords(@Param("userId") userId: string, @Query() paginationDto: PaginationDto) {
    return this.usersService.getUserPublicWords(userId, paginationDto);
  }

  @Get(":userId/definitions")
  @Public()
  async getUserDefinitions(@Param("userId") userId: string, @Query() paginationDto: PaginationDto) {
    return this.usersService.getUserPublicDefinitions(userId, paginationDto);
  }
}
