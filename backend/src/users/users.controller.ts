import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { PaginationDto } from "../common/dto/pagination.dto";
import { IStorageService, STORAGE_SERVICE } from "../common/services/storage/storage.interface";
import { UpdateNicknameDto } from "./dto/update-nickname.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(STORAGE_SERVICE) private readonly storageService: IStorageService,
  ) { }

  @Get("/users/me")
  getMe(@CurrentUser() user: User) {
    return user;
  }

  @Patch("/users/me/profile")
  @UseInterceptors(FileInterceptor("profilePicture"))
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let profilePictureUrl: string | undefined;

    if (file) {
      profilePictureUrl = await this.storageService.uploadFile(file, "profiles");
    }

    return this.usersService.updateProfile(user.id, {
      ...updateProfileDto,
      profilePicture: profilePictureUrl,
    });
  }

  @Patch("/users/me/nickname")
  async updateNickname(@CurrentUser() user: User, @Body() updateNicknameDto: UpdateNicknameDto) {
    return this.usersService.updateNickname(user.id, updateNicknameDto.nickname);
  }

  @Get("/users/:userId/profile")
  @Public()
  async getUserProfile(@Param("userId") userId: string) {
    return this.usersService.getUserProfile(userId);
  }

  @Get("/users/:userId/words")
  @Public()
  async getUserWords(@Param("userId") userId: string, @Query() paginationDto: PaginationDto) {
    return this.usersService.getUserPublicWords(userId, paginationDto);
  }

  @Get("/users/:userId/definitions")
  @Public()
  async getUserDefinitions(@Param("userId") userId: string, @Query() paginationDto: PaginationDto) {
    return this.usersService.getUserPublicDefinitions(userId, paginationDto);
  }
}
